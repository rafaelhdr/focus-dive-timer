// Legacy service - functionality moved to spotifyStore.ts
// Keeping minimal exports for backward compatibility

export const spotifyPlayerService = {
  initialize: () => {
    console.warn('spotifyPlayerService.initialize is deprecated - use useSpotifyStore instead');
    return Promise.resolve(false);
  },
  
  loadPlaylist: () => {
    console.warn('spotifyPlayerService.loadPlaylist is deprecated - use useSpotifyStore instead');
    return Promise.resolve({ success: false, error: 'Use global Spotify store instead' });
  },
  
  togglePlayback: () => {
    console.warn('spotifyPlayerService.togglePlayback is deprecated - use useSpotifyStore instead');
    return Promise.resolve();
  },
  
  getCurrentState: () => {
    console.warn('spotifyPlayerService.getCurrentState is deprecated - use useSpotifyStore instead');
    return Promise.resolve(null);
  },
  
  getAvailablePlaylists: () => {
    console.warn('spotifyPlayerService.getAvailablePlaylists is deprecated - use useSpotifyStore instead');
    return {};
  },
  
  disconnect: () => {
    console.warn('spotifyPlayerService.disconnect is deprecated - use useSpotifyStore instead');
  },
  
  getDeviceId: () => {
    console.warn('spotifyPlayerService.getDeviceId is deprecated - use useSpotifyStore instead');
    return '';
  },
  
  isPlayerReady: () => {
    console.warn('spotifyPlayerService.isPlayerReady is deprecated - use useSpotifyStore instead');
    return false;
  }
};
