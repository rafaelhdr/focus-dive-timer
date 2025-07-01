
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Music } from 'lucide-react';
import { useSpotifyStore } from '@/store/spotifyStore';

const MiniSpotifyPlayer = () => {
  const { isReady, playerState, togglePlayback } = useSpotifyStore();

  if (!isReady || !playerState?.track) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-background border rounded-lg shadow-lg p-3 z-50 max-w-xs">
      <div className="flex items-center gap-3">
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
      </div>
    </div>
  );
};

export default MiniSpotifyPlayer;
