
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ALARM_SOUNDS = [
  { id: 'minimalistic', name: 'Minimalistic', path: '/alarm-beeps/minimalistic.mp3' },
  { id: 'wooden', name: 'Wooden', path: '/alarm-beeps/wooden.mp3' },
  { id: 'snappy', name: 'Snappy', path: '/alarm-beeps/snappy.mp3' },
  { id: 'level', name: 'Level', path: '/alarm-beeps/level.mp3' },
];

const Settings = () => {
  const { settings, updateSettings, saveSoundSettings, isLoading } = useTimer();
  const { enableSound, volume = 1, alarmSound = 'minimalistic' } = settings;
  const [currentVolume, setCurrentVolume] = useState(volume);
  const [currentSound, setCurrentSound] = useState(alarmSound);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  React.useEffect(() => {
    const selectedSound = ALARM_SOUNDS.find(s => s.id === currentSound) || ALARM_SOUNDS[0];
    audioRef.current = new Audio(selectedSound.path);
    if (audioRef.current) {
      audioRef.current.volume = currentVolume;
    }
    
    // Sync local volume state with settings when they load
    setCurrentVolume(volume);
    setCurrentSound(alarmSound);
  }, [volume, alarmSound]);

  // Update audio volume when it changes
  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = currentVolume;
    }
  }, [currentVolume]);

  // Update audio source when sound changes
  React.useEffect(() => {
    const selectedSound = ALARM_SOUNDS.find(s => s.id === currentSound) || ALARM_SOUNDS[0];
    if (audioRef.current) {
      audioRef.current.src = selectedSound.path;
    }
  }, [currentSound]);

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];
    setCurrentVolume(newVolume);
  };

  const handleSaveSettings = async () => {
    await saveSoundSettings(enableSound, currentVolume, currentSound);
  };

  const handleToggleSound = async (enabled: boolean) => {
    await saveSoundSettings(enabled, currentVolume, currentSound);
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
                <Label htmlFor="alarm-sound" className="flex items-center gap-2">
                  Alarm Sound
                </Label>
                <Select
                  value={currentSound}
                  onValueChange={setCurrentSound}
                  disabled={!enableSound || isLoading}
                >
                  <SelectTrigger id="alarm-sound" className="w-full">
                    <SelectValue placeholder="Select a sound" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALARM_SOUNDS.map(sound => (
                      <SelectItem key={sound.id} value={sound.id}>
                        {sound.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  onClick={handleSaveSettings} 
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
