import React, { useState } from 'react';
import { Volume2, Volume, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import ThemeToggle from '@/components/ThemeToggle';
import Navigation from '@/components/Navigation';
import { useTimer } from '@/hooks/useTimer';

const Settings = () => {
  const { settings, updateSettings, saveSoundSettings, isLoading } = useTimer();
  const { enableSound, volume = 1 } = settings;
  const [currentVolume, setCurrentVolume] = useState(volume);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  React.useEffect(() => {
    audioRef.current = new Audio('/beep.mp3');
    if (audioRef.current) {
      audioRef.current.volume = currentVolume;
    }
    
    // Sync local volume state with settings when they load
    setCurrentVolume(volume);
  }, [volume]);

  // Update audio volume when it changes
  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = currentVolume;
    }
  }, [currentVolume]);

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];
    setCurrentVolume(newVolume);
  };

  const handleSaveVolume = async () => {
    await saveSoundSettings(enableSound, currentVolume);
  };

  const handleToggleSound = async (enabled: boolean) => {
    await saveSoundSettings(enabled, currentVolume);
  };

  const playTestSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.error("Error playing sound:", err));
    }
  };

  const getVolumeIcon = () => {
    if (currentVolume === 0) return <VolumeX className="h-5 w-5" />;
    if (currentVolume < 0.5) return <Volume className="h-5 w-5" />;
    return <Volume2 className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-background p-4 transition-colors duration-300">
      <Navigation />
      
      <div className="pt-16 flex flex-col items-center w-full max-w-md">
        <header className="mb-8 text-center relative w-full">
          <div className="absolute right-0 top-0">
            <ThemeToggle />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Customize your Focus Dive experience</p>
        </header>

        <div className="w-full max-w-md space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Sound Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="sound-toggle" className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" /> Sound Notification
                </Label>
                <Switch
                  id="sound-toggle"
                  checked={enableSound}
                  onCheckedChange={handleToggleSound}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="volume-slider" className="flex items-center gap-2">
                    {getVolumeIcon()} Volume
                  </Label>
                  <span className="font-medium">{Math.round(currentVolume * 100)}%</span>
                </div>
                <Slider
                  id="volume-slider"
                  min={0}
                  max={1}
                  step={0.01}
                  value={[currentVolume]}
                  onValueChange={handleVolumeChange}
                  className="py-4"
                  disabled={!enableSound || isLoading}
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={playTestSound} 
                  className="flex-1"
                  disabled={!enableSound || isLoading}
                >
                  Test Sound
                </Button>
                <Button 
                  onClick={handleSaveVolume} 
                  className="flex-1"
                  disabled={!enableSound || isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Volume'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Slack className="h-5 w-5" />
                Integrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Connect to external services to enhance your focus experience</p>
            </CardContent>
            <CardFooter className="flex justify-end border-t px-6 py-4">
              <Button variant="outline" className="gap-2">
                <Slack className="h-4 w-4" />
                Block Distractions
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
