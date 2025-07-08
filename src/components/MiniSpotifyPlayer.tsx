
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Play, Pause, Music, Settings, SkipBack, SkipForward, ExternalLink } from 'lucide-react';
import { useSpotifyStore } from '@/store/spotifyStore';
import { useTimerStore } from '@/store/timerStore';

const MiniSpotifyPlayer = () => {
  const { 
    isReady, 
    playerState, 
    focusPlaylist,
    togglePlayback, 
    nextTrack, 
    previousTrack,
    loadPlaylist 
  } = useSpotifyStore();
  const { isActive: isTimerActive, mode: timerMode } = useTimerStore();
  const navigate = useNavigate();

  // Auto-load focus playlist if no track is playing
  useEffect(() => {
    if (isReady && !playerState?.track && focusPlaylist) {
      loadPlaylist(focusPlaylist);
    }
  }, [isReady, playerState?.track, focusPlaylist, loadPlaylist]);

  // Auto-start playlist when timer becomes active
  useEffect(() => {
    if (isReady && isTimerActive && playerState?.track && !playerState.isPlaying) {
      togglePlayback();
    }
  }, [isReady, isTimerActive, playerState?.track, playerState?.isPlaying, togglePlayback]);

  if (!isReady) {
    return null;
  }

  const handleSettingsClick = () => {
    navigate('/integrations/spotify');
  };

  // Show when ready, even without a track
  return (
    <div className="fixed bottom-4 right-4 bg-background border rounded-lg shadow-lg p-3 z-50 max-w-xs">
      <div className="flex items-center gap-2">
        {/* Show controls only if there's a track */}
        {playerState?.track ? (
          <>
            <div className="flex items-center gap-1">
              <Button
                onClick={previousTrack}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={togglePlayback}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
              >
                {playerState.isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                onClick={nextTrack}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{playerState.track.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {playerState.track.artists.map(artist => artist.name).join(', ')}
              </p>
            </div>
            
            {playerState.track.album.images[0] ? (
              <img 
                src={playerState.track.album.images[0].url} 
                alt="Album cover"
                className="w-10 h-10 rounded object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                <Music className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </>
        ) : (
          <>
            {/* Show message when no playlist is configured */}
            {!focusPlaylist ? (
              <>
                <div className="flex items-center gap-2 flex-1">
                  <Music className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">No Focus Playlist</p>
                    <Button
                      onClick={handleSettingsClick}
                      variant="link"
                      className="h-auto p-0 text-xs text-primary"
                    >
                      Configure Spotify <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-1">
                  <Music className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Spotify Ready</p>
                    <p className="text-xs text-muted-foreground">Loading focus playlist...</p>
                  </div>
                </div>
              </>
            )}
          </>
        )}
        
        <Button
          onClick={handleSettingsClick}
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MiniSpotifyPlayer;
