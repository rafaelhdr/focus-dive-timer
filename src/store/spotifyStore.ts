import { create } from 'zustand';
import { getSpotifyAccessToken } from '@/services/spotifyService';

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

interface SpotifyStore {
  // State
  isInitializing: boolean;
  isReady: boolean;
  playerState: SpotifyPlayerState | null;
  error: string;
  isLoadingPlaylist: boolean;
  selectedPlaylist: string;
  isShuffleEnabled: boolean;
  
  // Playlist search state
  userPlaylists: any[];
  isLoadingPlaylists: boolean;
  playlistSearchQuery: string;
  searchResults: any[];
  isSearching: boolean;
  
  // Internal player references
  player: any;
  deviceId: string;
  accessToken: string;
  
  // Actions
  initialize: () => Promise<void>;
  loadPlaylist: (playlistId?: string) => Promise<void>;
  togglePlayback: () => Promise<void>;
  updatePlayerState: () => Promise<void>;
  transferPlaybackToDevice: () => Promise<{ success: boolean; error?: string }>;
  setSelectedPlaylist: (playlist: string) => void;
  setShuffleEnabled: (enabled: boolean) => void;
  toggleShuffle: () => Promise<void>;
  disconnect: () => void;
  clearError: () => void;
  
  // Playlist actions
  fetchUserPlaylists: () => Promise<void>;
  searchPlaylists: (query: string) => Promise<void>;
  setPlaylistSearchQuery: (query: string) => void;
  getAllPlaylists: () => any[];
}

export const useSpotifyStore = create<SpotifyStore>((set, get) => ({
  // Initial state
  isInitializing: false,
  isReady: false,
  playerState: null,
  error: '',
  isLoadingPlaylist: false,
  selectedPlaylist: '',
  isShuffleEnabled: false,
  userPlaylists: [],
  isLoadingPlaylists: false,
  playlistSearchQuery: '',
  searchResults: [],
  isSearching: false,
  player: null,
  deviceId: '',
  accessToken: '',

  initialize: async () => {
    const state = get();
    if (state.isReady || state.isInitializing) return;

    set({ isInitializing: true, error: '' });

    try {
      // Get access token
      const tokenResult = await getSpotifyAccessToken();
      if (!tokenResult.success || !tokenResult.token) {
        throw new Error(tokenResult.error || 'Failed to get access token');
      }

      if (!window.Spotify) {
        throw new Error('Spotify Web Playback SDK not loaded');
      }

      const accessToken = tokenResult.token;
      set({ accessToken });

      const player = new window.Spotify.Player({
        name: 'Focus Dive Player',
        getOAuthToken: (cb: (token: string) => void) => {
          cb(accessToken);
        },
        volume: 0.5,
      });

      // Error handling
      player.addListener('initialization_error', ({ message }: any) => {
        console.error('Spotify initialization error:', message);
        set({ error: 'Failed to initialize Spotify player', isInitializing: false });
      });

      player.addListener('authentication_error', ({ message }: any) => {
        console.error('Spotify authentication error:', message);
        set({ error: 'Spotify authentication failed', isInitializing: false });
      });

      player.addListener('account_error', ({ message }: any) => {
        console.error('Spotify account error:', message);
        set({ error: 'Spotify account error', isInitializing: false });
      });

      player.addListener('playback_error', ({ message }: any) => {
        console.error('Spotify playback error:', message);
      });

      // Ready
      player.addListener('ready', ({ device_id }: any) => {
        console.log('Spotify player ready with device ID:', device_id);
        set({ 
          deviceId: device_id, 
          isReady: true, 
          isInitializing: false,
          player 
        });
        get().updatePlayerState();
      });

      // Not ready
      player.addListener('not_ready', ({ device_id }: any) => {
        console.log('Spotify player not ready:', device_id);
        set({ isReady: false });
      });

      // Connect to the player
      player.connect();

    } catch (error) {
      console.error('Error initializing Spotify player:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred while initializing the player',
        isInitializing: false 
      });
    }
  },

  transferPlaybackToDevice: async () => {
    const { deviceId, accessToken } = get();
    
    if (!deviceId || !accessToken) {
      return { success: false, error: 'Device not ready or no access token' };
    }

    try {
      console.log('Transferring playback to Focus Dive device:', deviceId);
      
      const response = await fetch(`https://api.spotify.com/v1/me/player`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: false,
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
  },

  loadPlaylist: async (playlistId) => {
    const { isReady, deviceId, accessToken, transferPlaybackToDevice, isShuffleEnabled, userPlaylists } = get();
    
    if (!isReady || !deviceId) {
      set({ error: 'Player not ready' });
      return;
    }

    if (!playlistId) {
      set({ error: 'No playlist selected' });
      return;
    }

    // Find the playlist in user playlists
    const userPlaylist = userPlaylists.find(p => p.id === playlistId);
    if (!userPlaylist) {
      set({ error: 'Playlist not found' });
      return;
    }

    set({ isLoadingPlaylist: true, error: '' });

    try {
      console.log(`Loading playlist: ${userPlaylist.name}`);
      
      // First, try to transfer playback to this device
      const transferResult = await transferPlaybackToDevice();
      if (!transferResult.success) {
        console.warn('Failed to transfer playback, but continuing with playlist load:', transferResult.error);
      }

      // Wait a moment for the device transfer to take effect
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // If shuffle is enabled, enable it via Spotify API first
      if (isShuffleEnabled) {
        console.log('Enabling shuffle mode via Spotify API...');
        const shuffleResponse = await fetch(`https://api.spotify.com/v1/me/player/shuffle?state=true`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!shuffleResponse.ok) {
          console.warn('Failed to enable shuffle mode, but continuing with playlist load');
        } else {
          console.log('Shuffle mode enabled successfully');
        }
        
        // Wait a moment for shuffle to take effect
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Load the playlist from the beginning (no offset)
      const requestBody = {
        context_uri: `spotify:playlist:${playlistId}`,
        device_id: deviceId,
      };
      
      const response = await fetch(`https://api.spotify.com/v1/me/player/play`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to load playlist:', errorData);
        
        // If we get "No active device found", try to transfer playback again
        if (errorData.error?.reason === 'NO_ACTIVE_DEVICE') {
          console.log('No active device found, attempting to activate Focus Dive device...');
          const retryTransfer = await transferPlaybackToDevice();
          
          if (retryTransfer.success) {
            // Wait a bit more and retry the playlist load
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const retryResponse = await fetch(`https://api.spotify.com/v1/me/player/play`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
            });

            if (retryResponse.ok) {
              console.log('Playlist loaded successfully after device activation');
              set({ isLoadingPlaylist: false });
              setTimeout(() => get().updatePlayerState(), 1000);
              return;
            }
          }
        }
        
        set({ 
          error: errorData.error?.message || 'Failed to load playlist',
          isLoadingPlaylist: false 
        });
        return;
      }

      console.log('Playlist loaded successfully');
      set({ isLoadingPlaylist: false });
      setTimeout(() => get().updatePlayerState(), 1000);
    } catch (error) {
      console.error('Error loading playlist:', error);
      set({ 
        error: 'Network error while loading playlist',
        isLoadingPlaylist: false 
      });
    }
  },

  togglePlayback: async () => {
    const { player, isReady } = get();
    
    if (!player || !isReady) {
      console.error('Spotify player not ready');
      return;
    }

    try {
      await player.togglePlay();
      setTimeout(() => get().updatePlayerState(), 500);
    } catch (error) {
      console.error('Error toggling playback:', error);
      set({ error: 'Failed to control playback' });
    }
  },

  updatePlayerState: async () => {
    const { player, isReady } = get();
    
    if (!player || !isReady) {
      set({ playerState: null });
      return;
    }

    try {
      const state = await player.getCurrentState();
      
      if (!state) {
        set({ playerState: { isPlaying: false } });
        return;
      }

      set({
        playerState: {
          isPlaying: !state.paused,
          track: state.track_window?.current_track ? {
            name: state.track_window.current_track.name,
            artists: state.track_window.current_track.artists,
            album: state.track_window.current_track.album,
          } : undefined,
        }
      });
    } catch (error) {
      console.error('Error getting player state:', error);
      set({ playerState: null });
    }
  },

  setSelectedPlaylist: (playlist: string) => {
    set({ selectedPlaylist: playlist });
  },

  setShuffleEnabled: (enabled: boolean) => {
    set({ isShuffleEnabled: enabled });
  },

  toggleShuffle: async () => {
    const { accessToken, isShuffleEnabled } = get();
    
    if (!accessToken) {
      console.error('No access token available for shuffle');
      return;
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/shuffle?state=${!isShuffleEnabled}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        console.log(`Shuffle ${!isShuffleEnabled ? 'enabled' : 'disabled'}`);
        set({ isShuffleEnabled: !isShuffleEnabled });
      } else {
        console.error('Failed to toggle shuffle:', await response.text());
      }
    } catch (error) {
      console.error('Error toggling shuffle:', error);
    }
  },

  disconnect: () => {
    const { player } = get();
    if (player) {
      player.disconnect();
    }
    set({
      player: null,
      isReady: false,
      deviceId: '',
      accessToken: '',
      playerState: null,
      error: '',
      isShuffleEnabled: false,
    });
  },

  clearError: () => {
    set({ error: '' });
  },

  fetchUserPlaylists: async () => {
    const { isReady } = get();
    
    if (!isReady) {
      console.log('Player not ready, skipping playlist fetch');
      return;
    }

    set({ isLoadingPlaylists: true, error: '' });

    try {
      const { getUserPlaylists } = await import('@/services/spotifyService');
      const result = await getUserPlaylists();

      if (result.success) {
        console.log('User playlists loaded and cached for search');
        set({ 
          userPlaylists: result.playlists || [],
          isLoadingPlaylists: false 
        });
      } else {
        console.error('Failed to fetch user playlists:', result.error);
        set({ 
          error: result.error || 'Failed to fetch playlists',
          isLoadingPlaylists: false 
        });
      }
    } catch (error) {
      console.error('Error fetching user playlists:', error);
      set({ 
        error: 'Failed to fetch playlists',
        isLoadingPlaylists: false 
      });
    }
  },

  searchPlaylists: async (query: string) => {
    const { userPlaylists } = get();
    
    set({ playlistSearchQuery: query, isSearching: true });

    if (!query.trim()) {
      set({ searchResults: [], isSearching: false });
      return;
    }

    try {
      console.log('Starting playlist search with query:', query);
      const { searchUserPlaylists } = await import('@/services/spotifyService');
      const result = await searchUserPlaylists(query, userPlaylists);

      if (result.success) {
        console.log('Search completed successfully, results:', result.playlists?.length || 0);
        set({ 
          searchResults: result.playlists || [],
          isSearching: false 
        });
      } else {
        console.error('Failed to search playlists:', result.error);
        set({ 
          searchResults: [],
          isSearching: false,
          error: result.error || 'Search failed'
        });
      }
    } catch (error) {
      console.error('Error searching playlists:', error);
      set({ 
        searchResults: [],
        isSearching: false,
        error: 'Search failed'
      });
    }
  },

  setPlaylistSearchQuery: (query: string) => {
    set({ playlistSearchQuery: query });
  },

  getAllPlaylists: () => {
    const { userPlaylists } = get();
    return userPlaylists.map(playlist => ({
      ...playlist,
      isPublic: false
    }));
  },
}));
