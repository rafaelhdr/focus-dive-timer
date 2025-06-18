
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
