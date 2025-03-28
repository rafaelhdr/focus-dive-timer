
import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Volume2, Volume, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ThemeToggle from '@/components/ThemeToggle';
import { useTimer } from '@/hooks/useTimer';
import { toast } from 'sonner';

const Settings = () => {
  const { settings, updateSettings } = useTimer();
  const { enableSound, volume = 1 } = settings;
  const [currentVolume, setCurrentVolume] = useState(volume);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  React.useEffect(() => {
    audioRef.current = new Audio('/beep.mp3');
    if (audioRef.current) {
      audioRef.current.volume = currentVolume;
    }
  }, []);

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

  const handleSaveVolume = () => {
    updateSettings({ volume: currentVolume });
    toast.success('Volume settings saved');
  };

  const handleToggleSound = (enabled: boolean) => {
    updateSettings({ enableSound: enabled });
    toast.success(`Sound notifications ${enabled ? 'enabled' : 'disabled'}`);
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
      <header className="mb-8 text-center relative w-full max-w-md">
        <div className="absolute left-0 top-0">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
        </div>
        <div className="absolute right-0 top-0">
          <ThemeToggle />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Customize your Focus Dive experience</p>
      </header>

      <div className="w-full max-w-md">
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
                disabled={!enableSound}
              />
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={playTestSound} 
                className="flex-1"
                disabled={!enableSound}
              >
                Test Sound
              </Button>
              <Button 
                onClick={handleSaveVolume} 
                className="flex-1"
                disabled={!enableSound || volume === currentVolume}
              >
                Save Volume
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
