
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { fetchPreferences, savePreferences } from '@/services/api';

type TimerMode = 'focus' | 'break';

interface TimerSettings {
  focusDuration: number; // in minutes
  breakDuration: number; // in minutes
  enableSound: boolean;
  volume?: number; // Sound volume (0 to 1)
}

export function useTimer() {
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // default 25 mins in seconds
  const [settings, setSettings] = useState<TimerSettings>({
    focusDuration: 25,
    breakDuration: 5,
    enableSound: true,
    volume: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const preferencesLoadedRef = useRef(false);
  
  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio('/beep.mp3');
    if (audioRef.current && settings.volume !== undefined) {
      audioRef.current.volume = settings.volume;
    }
  }, []);
  
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
  
  // Update volume when settings change
  useEffect(() => {
    if (audioRef.current && settings.volume !== undefined) {
      audioRef.current.volume = settings.volume;
    }
  }, [settings.volume]);
  
  // Timer logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      // Use window.setInterval instead of setInterval to ensure proper typing
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // When timer ends
      if (settings.enableSound && audioRef.current) {
        audioRef.current.play().catch(err => console.error("Error playing sound:", err));
      }
      
      // Switch modes
      const nextMode = mode === 'focus' ? 'break' : 'focus';
      setMode(nextMode);
      
      // Set new time based on the mode
      const nextDuration = nextMode === 'focus' 
        ? settings.focusDuration * 60 
        : settings.breakDuration * 60;
      
      setTimeLeft(nextDuration);
      
      // Notify the user
      toast(`Time's up! ${nextMode === 'focus' ? 'Focus time' : 'Break time'} started.`);
    }
    
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, timeLeft, mode, settings]);
  
  // Start/pause timer
  const toggleTimer = () => {
    setIsActive(!isActive);
  };
  
  // Reset timer to current mode's full duration
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(
      mode === 'focus' 
        ? settings.focusDuration * 60 
        : settings.breakDuration * 60
    );
  };
  
  // Manually change mode
  const toggleMode = () => {
    const nextMode = mode === 'focus' ? 'break' : 'focus';
    setMode(nextMode);
    setIsActive(false);
    setTimeLeft(
      nextMode === 'focus' 
        ? settings.focusDuration * 60 
        : settings.breakDuration * 60
    );
  };
  
  // Save sound preferences to API
  const saveSoundSettings = useCallback(async (enableSound: boolean, volume: number) => {
    setIsLoading(true);
    try {
      console.log('Saving sound settings:', { enableSound, volume });
      const success = await savePreferences({
        focus_beep_enabled: enableSound,
        focus_beep_volume: Math.round(volume * 100), // Convert from 0-1 to 0-100
      });
      
      if (success) {
        toast.success('Sound settings saved');
        // Update local settings to ensure consistency
        setSettings(prev => ({
          ...prev,
          enableSound,
          volume,
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
  
  // Update timer settings
  const updateSettings = (newSettings: Partial<TimerSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // Update current timeLeft if we changed the duration of the current mode
      if (!isActive) {
        if (mode === 'focus' && newSettings.focusDuration !== undefined) {
          setTimeLeft(newSettings.focusDuration * 60);
        } else if (mode === 'break' && newSettings.breakDuration !== undefined) {
          setTimeLeft(newSettings.breakDuration * 60);
        }
      }
      
      return updated;
    });
  };
  
  // Format time as MM:SS
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return {
    isActive,
    mode,
    timeLeft,
    settings,
    isLoading,
    formattedTime: formatTime(timeLeft),
    toggleTimer,
    resetTimer,
    toggleMode,
    updateSettings,
    saveSoundSettings,
  };
}
