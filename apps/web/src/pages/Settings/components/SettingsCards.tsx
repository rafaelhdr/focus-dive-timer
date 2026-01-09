import { useRef } from 'react';
import { Volume2, Volume, VolumeX, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@focusdive/ui";
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAutoSaveSettings } from '@/hooks/useAutoSaveSettings';

const ALARM_SOUNDS = [
  { id: 'minimalistic', name: 'Minimalistic', path: '/alarm-beeps/minimalistic.mp3' },
  { id: 'wooden', name: 'Wooden', path: '/alarm-beeps/wooden.mp3' },
  { id: 'snappy', name: 'Snappy', path: '/alarm-beeps/snappy.mp3' },
  { id: 'level', name: 'Level', path: '/alarm-beeps/level.mp3' },
];

const SettingsCards = () => {
  const { draft, patchDraft } = useAutoSaveSettings();
  const handleToggleSound = console.log
  const audioEl = useRef<HTMLAudioElement>(null);

  const getVolumeIcon = () => {
    if (draft.focusBeepVolume === 0) return <VolumeX className="h-5 w-5" />;
    if (draft.focusBeepVolume < 0.5) return <Volume className="h-5 w-5" />;
    return <Volume2 className="h-5 w-5" />;
  };

  const playTestSound = () => {
    const element = audioEl.current;
    if (!element) return;
    element.volume = draft.focusBeepVolume;
    element.currentTime = 0;
    void element.play();
  };

  const getAlarmSoundPath = (soundId: string) => {
    const sound = ALARM_SOUNDS.find(s => s.id === soundId);
    return sound ? sound.path : ALARM_SOUNDS[0].path;
  }

  if (!draft) {
    return null
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <audio ref={audioEl} src={getAlarmSoundPath(draft.alarmSound)} preload="auto" />
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
              checked={draft.focusBeepEnabled}
              onCheckedChange={handleToggleSound}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alarm-sound" className="flex items-center gap-2">
              Alarm Sound
            </Label>
            <Select
              value={draft.alarmSound || 'minimalistic'}
              onValueChange={(value) => patchDraft({ alarmSound: value })}
              disabled={!draft.focusBeepEnabled}
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
              <span className="font-medium">{Math.round(draft.focusBeepVolume * 100)}%</span>
            </div>
            <Slider
              id="volume-slider"
              min={0}
              max={1}
              step={0.01}
              value={[draft?.focusBeepVolume]}
              onValueChange={(values => patchDraft({ focusBeepVolume: values[0] }))}
              className="py-4"
              disabled={!draft.focusBeepEnabled}
            />
          </div>

          <div className="flex gap-4">
            <Button
              onClick={playTestSound}
              className="flex-1"
              disabled={!draft.focusBeepEnabled}
            >
              Test Sound
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Clock className="h-5 w-5" /> Timer Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="default-focus-duration">Default Focus Duration</Label>
              <span className="font-medium">{draft.defaultFocusDuration} minutes</span>
            </div>
            <Slider
              id="default-focus-duration"
              min={5}
              max={60}
              step={5}
              value={[draft.defaultFocusDuration]}
              onValueChange={(values) => patchDraft({ defaultFocusDuration: values[0] })}
              className="py-4"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="default-break-duration">Default Break Duration</Label>
              <span className="font-medium">{draft.defaultBreakDuration} minutes</span>
            </div>
            <Slider
              id="default-break-duration"
              min={1}
              max={30}
              step={1}
              value={[draft.defaultBreakDuration]}
              onValueChange={(values) => patchDraft({ defaultBreakDuration: values[0] })}
              className="py-4"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="autostart-break"
              checked={draft.autostartBreak}
              onCheckedChange={(checked) => patchDraft({ autostartBreak: checked === true })}
            />
            <Label htmlFor="autostart-break" className="cursor-pointer">
              Autostart break when focus finishes
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="autostart-focus"
              checked={draft.autostartFocus}
              onCheckedChange={(checked) => patchDraft({ autostartFocus: checked === true })}
            />
            <Label htmlFor="autostart-focus" className="cursor-pointer">
              Autostart focus when break finishes
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SettingsCards;
