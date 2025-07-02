import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, Music } from 'lucide-react';
import { useSpotifyStore } from '@/store/spotifyStore';
import PlaylistSearch from './PlaylistSearch';
import { useToast } from '@/hooks/use-toast';

interface SpotifyConfigFormProps {
  isConnected: boolean;
  isAuthenticated: boolean;
}

const SpotifyConfigForm = ({ isConnected, isAuthenticated }: SpotifyConfigFormProps) => {
  const {
    spotifyEnabled,
    focusPlaylist,
    breakPlaylist,
    breakKeepFocusSound,
    isSavingSettings,
    setSpotifyEnabled,
    setFocusPlaylist,
    setBreakPlaylist,
    setBreakKeepFocusSound,
    loadSpotifySettings,
    saveSpotifySettingsToBackend,
    getAllPlaylists,
    fetchUserPlaylists,
    isReady,
  } = useSpotifyStore();

  const { toast } = useToast();
  
  // Local state for form data
  const [localSpotifyEnabled, setLocalSpotifyEnabled] = useState(false);
  const [localFocusPlaylist, setLocalFocusPlaylist] = useState('');
  const [localBreakPlaylist, setLocalBreakPlaylist] = useState('');
  const [localBreakKeepFocusSound, setLocalBreakKeepFocusSound] = useState(false);

  // Load settings when component mounts
  useEffect(() => {
    if (isAuthenticated && isConnected) {
      loadSpotifySettings();
    }
  }, [isAuthenticated, isConnected, loadSpotifySettings]);

  // Fetch playlists when player is ready
  useEffect(() => {
    if (isReady && isConnected) {
      fetchUserPlaylists();
    }
  }, [isReady, isConnected, fetchUserPlaylists]);

  // Update local state when store state changes (from backend)
  useEffect(() => {
    setLocalSpotifyEnabled(spotifyEnabled);
  }, [spotifyEnabled]);

  useEffect(() => {
    setLocalFocusPlaylist(focusPlaylist?.id || '');
  }, [focusPlaylist]);

  useEffect(() => {
    setLocalBreakPlaylist(breakPlaylist?.id || '');
  }, [breakPlaylist]);

  useEffect(() => {
    setLocalBreakKeepFocusSound(breakKeepFocusSound);
  }, [breakKeepFocusSound]);

  const handleSpotifyEnabledChange = (enabled: boolean) => {
    setLocalSpotifyEnabled(enabled);
  };

  const handleFocusPlaylistSelect = (playlistId: string) => {
    setLocalFocusPlaylist(playlistId);
  };

  const handleBreakPlaylistSelect = (playlistId: string) => {
    setLocalBreakPlaylist(playlistId);
  };

  const handleBreakKeepFocusSoundChange = (keepSound: boolean) => {
    setLocalBreakKeepFocusSound(keepSound);
  };

  const handleSaveSettings = async () => {
    // Update store with local values first
    setSpotifyEnabled(localSpotifyEnabled);
    setBreakKeepFocusSound(localBreakKeepFocusSound);
    
    // Handle playlist selections
    const allPlaylists = getAllPlaylists();
    
    if (localFocusPlaylist) {
      const selectedFocusPlaylist = allPlaylists.find(p => p.id === localFocusPlaylist);
      setFocusPlaylist(selectedFocusPlaylist || null);
    } else {
      setFocusPlaylist(null);
    }
    
    if (localBreakPlaylist) {
      const selectedBreakPlaylist = allPlaylists.find(p => p.id === localBreakPlaylist);
      setBreakPlaylist(selectedBreakPlaylist || null);
    } else {
      setBreakPlaylist(null);
    }
    
    // Save to backend
    const success = await saveSpotifySettingsToBackend();
    
    if (success) {
      toast({
        title: 'Settings Saved',
        description: 'Your Spotify integration settings have been saved successfully.',
      });
    } else {
      toast({ 
        title: 'Error',
        description: 'Failed to save Spotify settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const isDisabled = !isAuthenticated || !isConnected;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Spotify Configuration
        </CardTitle>
        <CardDescription>
          Configure your Spotify playlists for focus and break sessions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isAuthenticated && (
          <Alert>
            <AlertDescription>
              Please login to configure Spotify settings.
            </AlertDescription>
          </Alert>
        )}

        {!isConnected && isAuthenticated && (
          <Alert>
            <AlertDescription>
              Please connect your Spotify account to configure these settings.
            </AlertDescription>
          </Alert>
        )}

        {/* Enable/Disable Spotify Integration */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="spotify-enable" className="text-base">
              Enable Spotify Integration
            </Label>
            <div className="text-sm text-muted-foreground">
              Allow Focus Dive to control your Spotify playback during sessions
            </div>
          </div>
          <Switch
            id="spotify-enable"
            checked={localSpotifyEnabled}
            onCheckedChange={handleSpotifyEnabledChange}
            disabled={isDisabled || isSavingSettings}
          />
        </div>

        <Separator />

        {/* Focus Playlist Selection */}
        <div className="space-y-3">
          <div className="space-y-0.5">
            <Label className="text-base">Focus Playlist</Label>
            <div className="text-sm text-muted-foreground">
              Music to play during focus sessions
            </div>
          </div>
          <PlaylistSearch
            onSelect={handleFocusPlaylistSelect}
            selectedPlaylist={localFocusPlaylist}
            disabled={!localSpotifyEnabled || isDisabled}
          />
        </div>

        <Separator />

        {/* Break Playlist Selection */}
        <div className="space-y-3">
          <div className="space-y-0.5">
            <Label className="text-base">Break Playlist</Label>
            <div className="text-sm text-muted-foreground">
              Music to play during break sessions (optional)
            </div>
          </div>
          
          {/* Keep Focus Music During Breaks Checkbox */}
          <div className="flex items-center space-x-2 mb-3">
            <Checkbox
              id="break-keep-sound"
              checked={localBreakKeepFocusSound}
              onCheckedChange={handleBreakKeepFocusSoundChange}
              disabled={!localSpotifyEnabled || isDisabled}
            />
            <Label htmlFor="break-keep-sound" className="text-sm font-normal">
              Keep Focus Music During Breaks
            </Label>
          </div>
          
          <PlaylistSearch
            onSelect={handleBreakPlaylistSelect}
            selectedPlaylist={localBreakPlaylist}
            disabled={!localSpotifyEnabled || localBreakKeepFocusSound || isDisabled}
          />
          
          {localBreakKeepFocusSound && (
            <div className="text-xs text-muted-foreground mt-1">
              Break playlist is disabled because focus music will continue playing during breaks.
            </div>
          )}
        </div>

        <Separator />

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            disabled={isDisabled || isSavingSettings}
            className="flex items-center gap-2"
          >
            {isSavingSettings ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpotifyConfigForm;
