
declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

interface SpotifyPlayerState {
  isPlaying: boolean;
  track?: {
    name: string;
    artists: { name: string }[];
    album: { images: { url: string }[] };
  };
}

// Hardcoded public playlists for focus/work music
const PUBLIC_PLAYLISTS = {
  'focus-flow': {
    id: '37i9dQZF1DX0XUsuxWHRQd',
    name: 'Focus Flow',
    description: 'Instrumental beats to keep you in the zone'
  },
  'lofi-beats': {
    id: '37i9dQZF1DWWQRwui0ExPn', 
    name: 'Lo-Fi Beats',
    description: 'Chill beats to help you focus'
  },
  'peaceful-piano': {
    id: '37i9dQZF1DX4sWSpwq3LiO',
    name: 'Peaceful Piano',
    description: 'Relaxing piano music for concentration'
  }
};

class SpotifyPlayerService {
  private player: any = null;
  private deviceId: string = '';
  private isReady: boolean = false;
  private accessToken: string = '';

  async initialize(accessToken: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!window.Spotify) {
        console.error('Spotify Web Playback SDK not loaded');
        resolve(false);
        return;
      }

      this.accessToken = accessToken;

      this.player = new window.Spotify.Player({
        name: 'Focus Dive Player',
        getOAuthToken: (cb: (token: string) => void) => {
          cb(this.accessToken);
        },
        volume: 0.5,
      });

      // Error handling
      this.player.addListener('initialization_error', ({ message }: any) => {
        console.error('Spotify initialization error:', message);
        resolve(false);
      });

      this.player.addListener('authentication_error', ({ message }: any) => {
        console.error('Spotify authentication error:', message);
        resolve(false);
      });

      this.player.addListener('account_error', ({ message }: any) => {
        console.error('Spotify account error:', message);
        resolve(false);
      });

      this.player.addListener('playback_error', ({ message }: any) => {
        console.error('Spotify playback error:', message);
      });

      // Ready
      this.player.addListener('ready', ({ device_id }: any) => {
        console.log('Spotify player ready with device ID:', device_id);
        this.deviceId = device_id;
        this.isReady = true;
        resolve(true);
      });

      // Not ready
      this.player.addListener('not_ready', ({ device_id }: any) => {
        console.log('Spotify player not ready:', device_id);
        this.isReady = false;
      });

      // Connect to the player
      this.player.connect();
    });
  }

  async transferPlaybackToDevice(): Promise<{ success: boolean; error?: string }> {
    if (!this.deviceId || !this.accessToken) {
      return { success: false, error: 'Device not ready or no access token' };
    }

    try {
      console.log('Transferring playback to Focus Dive device:', this.deviceId);
      
      const response = await fetch(`https://api.spotify.com/v1/me/player`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_ids: [this.deviceId],
          play: false, // Don't start playing immediately
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to transfer playback:', errorData);
        return { 
          success: false, 
          error: errorData.error?.message || 'Failed to transfer playback to device' 
        };
      }

      console.log('Playback transferred successfully to Focus Dive device');
      return { success: true };
    } catch (error) {
      console.error('Error transferring playback:', error);
      return { 
        success: false, 
        error: 'Network error while transferring playback' 
      };
    }
  }

  async loadPlaylist(playlistKey: keyof typeof PUBLIC_PLAYLISTS = 'focus-flow'): Promise<{ success: boolean; error?: string }> {
    if (!this.isReady || !this.deviceId) {
      return { success: false, error: 'Player not ready' };
    }

    const playlist = PUBLIC_PLAYLISTS[playlistKey];
    if (!playlist) {
      return { success: false, error: 'Playlist not found' };
    }

    try {
      console.log(`Loading playlist: ${playlist.name}`);
      
      // First, try to transfer playback to this device
      const transferResult = await this.transferPlaybackToDevice();
      if (!transferResult.success) {
        console.warn('Failed to transfer playback, but continuing with playlist load:', transferResult.error);
      }

      // Wait a moment for the device transfer to take effect
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await fetch(`https://api.spotify.com/v1/me/player/play`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context_uri: `spotify:playlist:${playlist.id}`,
          device_id: this.deviceId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to load playlist:', errorData);
        
        // If we get "No active device found", try to transfer playback again
        if (errorData.error?.reason === 'NO_ACTIVE_DEVICE') {
          console.log('No active device found, attempting to activate Focus Dive device...');
          const retryTransfer = await this.transferPlaybackToDevice();
          
          if (retryTransfer.success) {
            // Wait a bit more and retry the playlist load
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const retryResponse = await fetch(`https://api.spotify.com/v1/me/player/play`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                context_uri: `spotify:playlist:${playlist.id}`,
                device_id: this.deviceId,
              }),
            });

            if (retryResponse.ok) {
              console.log('Playlist loaded successfully after device activation');
              return { success: true };
            }
          }
        }
        
        return { 
          success: false, 
          error: errorData.error?.message || 'Failed to load playlist' 
        };
      }

      console.log('Playlist loaded successfully');
      return { success: true };
    } catch (error) {
      console.error('Error loading playlist:', error);
      return { 
        success: false, 
        error: 'Network error while loading playlist' 
      };
    }
  }

  async togglePlayback(): Promise<void> {
    if (!this.player || !this.isReady) {
      console.error('Spotify player not ready');
      return;
    }

    try {
      await this.player.togglePlay();
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  }

  async getCurrentState(): Promise<SpotifyPlayerState | null> {
    if (!this.player || !this.isReady) {
      return null;
    }

    try {
      const state = await this.player.getCurrentState();
      
      if (!state) {
        return { isPlaying: false };
      }

      return {
        isPlaying: !state.paused,
        track: state.track_window?.current_track ? {
          name: state.track_window.current_track.name,
          artists: state.track_window.current_track.artists,
          album: state.track_window.current_track.album,
        } : undefined,
      };
    } catch (error) {
      console.error('Error getting player state:', error);
      return null;
    }
  }

  getAvailablePlaylists() {
    return PUBLIC_PLAYLISTS;
  }

  disconnect(): void {
    if (this.player) {
      this.player.disconnect();
      this.player = null;
      this.isReady = false;
      this.deviceId = '';
    }
  }

  getDeviceId(): string {
    return this.deviceId;
  }

  isPlayerReady(): boolean {
    return this.isReady;
  }
}

export const spotifyPlayerService = new SpotifyPlayerService();
