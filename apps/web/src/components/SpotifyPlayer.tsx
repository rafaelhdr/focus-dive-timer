import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Play, Pause, Loader2, AlertCircle, Music, ListMusic, Shuffle } from 'lucide-react';
import { useSpotifyStore } from '@/store/spotifyStore';
import PlaylistSearch from './PlaylistSearch';

const SpotifyPlayer = () => {
  const {
    isInitializing,
    isReady,
    playerState,
    error,
    isLoadingPlaylist,
    selectedPlaylist,
    isShuffleEnabled,
    initialize,
    loadPlaylist,
    togglePlayback,
    updatePlayerState,
    setSelectedPlaylist,
    setShuffleEnabled,
    clearError,
  } = useSpotifyStore();

  useEffect(() => {
    // Initialize player if not already done
    if (!isReady && !isInitializing && !error) {
      initialize();
    }
  }, [isReady, isInitializing, error, initialize]);

  const handleLoadPlaylist = async () => {
    await loadPlaylist(selectedPlaylist);
  };

  const handleRetry = () => {
    clearError();
    initialize();
  };

  if (error) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Spotify Player
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            onClick={handleRetry} 
            variant="outline" 
            className="mt-3"
            disabled={isInitializing}
          >
            {isInitializing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              'Retry'
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isInitializing) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Spotify Player
          </CardTitle>
          <CardDescription>Setting up your music player...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isReady) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Spotify Player
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Player not ready. Make sure you have Spotify open in another tab or the Spotify app running.
            </AlertDescription>
          </Alert>
          <Button 
            onClick={handleRetry} 
            variant="outline" 
            className="mt-3"
          >
            Retry Connection
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Spotify Player
        </CardTitle>
        <CardDescription>Control your music during focus sessions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Playlist Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ListMusic className="h-4 w-4" />
            <span className="text-sm font-medium">Choose Focus Music</span>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1">
              <PlaylistSearch 
                onSelect={setSelectedPlaylist}
                selectedPlaylist={selectedPlaylist}
              />
            </div>
            
            <Button 
              onClick={handleLoadPlaylist}
              disabled={isLoadingPlaylist}
              variant="outline"
            >
              {isLoadingPlaylist ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ListMusic className="h-4 w-4" />
                  Load
                </>
              )}
            </Button>
          </div>

          {/* Shuffle Option */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="shuffle" 
              checked={isShuffleEnabled}
              onCheckedChange={(checked) => setShuffleEnabled(!!checked)}
            />
            <label 
              htmlFor="shuffle" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
            >
              <Shuffle className="h-4 w-4" />
              Shuffle songs
            </label>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-4">
          <Button
            onClick={togglePlayback}
            size="lg"
            className="flex items-center gap-2"
          >
            {playerState?.isPlaying ? (
              <>
                <Pause className="h-5 w-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Play
              </>
            )}
          </Button>
          
          <div className="flex-1">
            {playerState?.track ? (
              <div>
                <p className="font-medium">{playerState.track.name}</p>
                <p className="text-sm text-muted-foreground">
                  {playerState.track.artists.map(artist => artist.name).join(', ')}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                {playerState?.isPlaying ? 'Playing...' : 'No track selected - Load a playlist first'}
              </p>
            )}
          </div>
          
          {playerState?.track?.album.images[0] && (
            <img 
              src={playerState.track.album.images[0].url} 
              alt="Album cover"
              className="w-12 h-12 rounded object-cover"
            />
          )}
        </div>
        
        <Button 
          onClick={updatePlayerState} 
          variant="ghost" 
          size="sm" 
          className="w-full"
        >
          Refresh State
        </Button>
      </CardContent>
    </Card>
  );
};

export default SpotifyPlayer;
