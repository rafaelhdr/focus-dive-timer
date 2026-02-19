import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useAutoSavePreferences } from '@/hooks/useAutoSavePreferences';

const PreferencesPanel: React.FC = () => {
  const { draft, patchDraft } = useAutoSavePreferences();

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl">Timer Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="focus-duration">Focus Duration</Label>
            <span className="font-medium">{draft?.defaultFocusDuration} minutes</span>
          </div>
          <Slider
            id="default-focus-duration"
            min={5}
            max={60}
            step={5}
            value={[draft?.defaultFocusDuration]}
            onValueChange={(values) => patchDraft({ defaultFocusDuration: values[0] })}
            className="py-4"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="break-duration">Break Duration</Label>
            <span className="font-medium">{draft?.defaultBreakDuration} minutes</span>
          </div>
          <Slider
            id="default-break-duration"
            min={1}
            max={30}
            step={1}
            value={[draft?.defaultBreakDuration]}
            onValueChange={(values) => patchDraft({ defaultBreakDuration: values[0] })}
            className="py-4"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PreferencesPanel;
