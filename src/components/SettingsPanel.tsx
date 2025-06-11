
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { analytics } from '@/utils/analytics';

interface SettingsPanelProps {
  focusDuration: number;
  breakDuration: number;
  onUpdateFocusDuration: (value: number) => void;
  onUpdateBreakDuration: (value: number) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  focusDuration,
  breakDuration,
  onUpdateFocusDuration,
  onUpdateBreakDuration,
}) => {
  const handleFocusDurationChange = (values: number[]) => {
    const newValue = values[0];
    analytics.settingsChanged('focus_duration', newValue);
    onUpdateFocusDuration(newValue);
  };

  const handleBreakDurationChange = (values: number[]) => {
    const newValue = values[0];
    analytics.settingsChanged('break_duration', newValue);
    onUpdateBreakDuration(newValue);
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl">Timer Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="focus-duration">Focus Duration</Label>
            <span className="font-medium">{focusDuration} minutes</span>
          </div>
          <Slider
            id="focus-duration"
            min={5}
            max={60}
            step={5}
            value={[focusDuration]}
            onValueChange={handleFocusDurationChange}
            className="py-4"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="break-duration">Break Duration</Label>
            <span className="font-medium">{breakDuration} minutes</span>
          </div>
          <Slider
            id="break-duration"
            min={1}
            max={30}
            step={1}
            value={[breakDuration]}
            onValueChange={handleBreakDurationChange}
            className="py-4"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsPanel;
