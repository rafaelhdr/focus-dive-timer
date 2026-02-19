import { Volume2, Volume, VolumeX, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@focusdive/ui";
import { ALARM_SOUNDS, playAlarm, AlarmSoundId } from "@focusdive/alarm";
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
import { useAutoSavePreferences } from '@/hooks/useAutoSavePreferences';

const PreferencesCards = () => {
  const { draft, patchDraft } = useAutoSavePreferences();
  const handleToggleSound = console.log

  const getVolumeIcon = () => {
    if (draft.focusBeepVolume === 0) return <VolumeX className="h-5 w-5" />;
    if (draft.focusBeepVolume < 0.5) return <Volume className="h-5 w-5" />;
    return <Volume2 className="h-5 w-5" />;
  };

  const playTestSound = () => {
    playAlarm(draft.alarmSound as AlarmSoundId, { volume: draft.focusBeepVolume });
  };

  if (!draft) {
    return null
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Sound Preferences</CardTitle>
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
              onValueChange={(value) => patchDraft({ alarmSound: value as AlarmSoundId })}
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
            <Clock className="h-5 w-5" /> Timer Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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

export default PreferencesCards;
