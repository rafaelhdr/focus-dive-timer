
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Pause, Loader2, AlertCircle, Music } from 'lucide-react';
import { spotifyPlayerService } from '@/services/spotifyPlayerService';
import { getSpotifyAccessToken } from '@/services/spotifyService';

interface SpotifyPlayerState {
  isPlaying: boolean;
  track?: {
    name: string;
    artists: { name: string }[];
    album: { images: { url: string }[] };
  };
}

const SpotifyPlayer = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [playerState, setPlayerState] = useState<SpotifyPlayerState | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    initializePlayer();
    
    return () => {
      spotifyPlayerService.disconnect();
    };
  }, []);

  const initializePlayer = async () => {
    try {
      setIsInitializing(true);
      setError('');

      // Get access token
      const tokenResult = await getSpotifyAccessToken();
      if (!tokenResult.success || !tokenResult.token) {
        setError(tokenResult.error || 'Failed to get access token');
        return;
      }

      // Initialize player
      const success = await spotifyPlayerService.initialize(tokenResult.token);
      if (success) {
        setIsReady(true);
        updatePlayerState();
      } else {
        setError('Failed to initialize Spotify player');
      }
    } catch (error) {
      console.error('Error initializing Spotify player:', error);
      setError('An error occurred while initializing the player');
    } finally {
      setIsInitializing(false);
    }
  };

  const updatePlayerState = async () => {
    const state = await spotifyPlayerService.getCurrentState();
    setPlayerState(state);
  };

  const handleTogglePlayback = async () => {
    try {
      await spotifyPlayerService.togglePlayback();
      // Update state after a short delay to allow for state change
      setTimeout(updatePlayerState, 500);
    } catch (error) {
      console.error('Error toggling playback:', error);
      setError('Failed to control playback');
    }
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
            onClick={initializePlayer} 
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
            onClick={initializePlayer} 
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
      <CardContent>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleTogglePlayback}
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
                {playerState?.isPlaying ? 'Playing...' : 'No track selected'}
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
          className="mt-3"
        >
          Refresh State
        </Button>
      </CardContent>
    </Card>
  );
};

export default SpotifyPlayer;
