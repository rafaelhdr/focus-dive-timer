
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { fetchPreferences, savePreferences } from '@/services/api';

interface TimerSettings {
  focusDuration: number; // in minutes
  breakDuration: number; // in minutes
  enableSound: boolean;
  volume?: number; // Sound volume (0 to 1)
  alarmSound?: string; // ID of the alarm sound
  autostartBreak: boolean; // Autostart break after focus
  autostartFocus: boolean; // Autostart focus after break
  defaultFocusDuration?: number; // Default focus duration
  defaultBreakDuration?: number; // Default break duration
}

export function useTimerSettings() {
  const [settings, setSettings] = useState<TimerSettings>({
    focusDuration: 25,
    breakDuration: 5,
    enableSound: true,
    volume: 1,
    alarmSound: 'minimalistic',
    autostartBreak: true,
    autostartFocus: true,
    defaultFocusDuration: 25,
    defaultBreakDuration: 5,
  });
  const [isLoading, setIsLoading] = useState(false);
  const preferencesLoadedRef = useRef(false);
  
  // Load preferences from API on mount
  useEffect(() => {
    const loadPreferences = async () => {
      if (preferencesLoadedRef.current) return;
      
      setIsLoading(true);
      try {
        console.log('Loading preferences from API...');
        const preferences = await fetchPreferences();
        console.log('Got preferences:', preferences);
        
        setSettings(prev => {
          const updatedSettings = {
            ...prev,
            enableSound: preferences.focus_beep_enabled,
            volume: preferences.focus_beep_volume / 100, // Convert from 0-100 to 0-1
            alarmSound: prev.alarmSound || 'minimalistic',
            autostartBreak: preferences.autostart_break !== undefined ? preferences.autostart_break : true,
            autostartFocus: preferences.autostart_focus !== undefined ? preferences.autostart_focus : true,
            defaultFocusDuration: preferences.default_focus_duration || 25,
            defaultBreakDuration: preferences.default_break_duration || 5,
          };
          
          console.log('Updated settings:', updatedSettings);
          return updatedSettings;
        });
        
        preferencesLoadedRef.current = true;
      } catch (error) {
        console.error('Failed to load preferences:', error);
        toast.error('Failed to load preferences');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPreferences();
  }, []);
  
  // Save sound preferences to API
  const saveSoundSettings = useCallback(async (enableSound: boolean, volume: number, alarmSound: string = 'minimalistic') => {
    setIsLoading(true);
    try {
      console.log('Saving sound settings:', { enableSound, volume, alarmSound });
      const success = await savePreferences({
        focus_beep_enabled: enableSound,
        focus_beep_volume: Math.round(volume * 100), // Convert from 0-1 to 0-100
        alarm_sound: alarmSound,
      });
      
      if (success) {
        toast.success('Sound settings saved');
        // Update local settings to ensure consistency
        setSettings(prev => ({
          ...prev,
          enableSound,
          volume,
          alarmSound,
        }));
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      toast.error('Error saving settings');
      console.error('Error saving sound settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save autostart preferences
  const saveTimerSettings = useCallback(async (autostartBreak: boolean, autostartFocus: boolean) => {
    setIsLoading(true);
    try {
      console.log('Saving timer settings:', { autostartBreak, autostartFocus });
      const success = await savePreferences({
        autostart_break: autostartBreak,
        autostart_focus: autostartFocus,
      });
      
      if (success) {
        toast.success('Timer settings saved');
        // Update local settings to ensure consistency
        setSettings(prev => ({
          ...prev,
          autostartBreak,
          autostartFocus,
        }));
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      toast.error('Error saving settings');
      console.error('Error saving timer settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Save default duration settings
  const saveDefaultDurations = useCallback(async (defaultFocusDuration: number, defaultBreakDuration: number) => {
    setIsLoading(true);
    try {
      console.log('Saving default durations:', { defaultFocusDuration, defaultBreakDuration });
      const success = await savePreferences({
        default_focus_duration: defaultFocusDuration,
        default_break_duration: defaultBreakDuration,
      });
      
      if (success) {
        toast.success('Default durations saved');
        // Update local settings to ensure consistency
        setSettings(prev => ({
          ...prev,
          defaultFocusDuration,
          defaultBreakDuration,
        }));
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      toast.error('Error saving settings');
      console.error('Error saving default durations:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Update timer settings
  const updateSettings = (newSettings: Partial<TimerSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };
  
  return {
    settings,
    isLoading,
    updateSettings,
    saveSoundSettings,
    saveTimerSettings,
    saveDefaultDurations,
  };
}
