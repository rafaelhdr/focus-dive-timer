
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { fetchPreferences, savePreferences } from '@/services/api';
import { useTimerSocket } from './useTimerSocket';

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
  const timerEndTimeRef = useRef<number | null>(null);
  
  // Initialize WebSocket communication
  const { subscribeToTimerUpdates, updateTimer } = useTimerSocket();
  
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

  // Subscribe to timer updates from server
  useEffect(() => {
    const unsubscribe = subscribeToTimerUpdates((data) => {
      if (data.timerEndsAt === null) return;
      
      const currentTime = Date.now();
      const endTime = data.timerEndsAt;
      const secondsLeft = Math.max(0, Math.floor((endTime - currentTime) / 1000));
      
      // Only update if there's an active timer or it's a different mode
      if (secondsLeft > 0 || mode !== data.currentTimer) {
        setMode(data.currentTimer);
        setTimeLeft(secondsLeft);
        timerEndTimeRef.current = endTime;
        
        if (secondsLeft > 0 && !isActive) {
          setIsActive(true);
        }
      }
    });
    
    return unsubscribe;
  }, [subscribeToTimerUpdates, mode, isActive]);
  
  // Update volume when settings change
  useEffect(() => {
    if (audioRef.current && settings.volume !== undefined) {
      audioRef.current.volume = settings.volume;
    }
  }, [settings.volume]);
  
  // Timer logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      // Calculate end time if not already set
      if (timerEndTimeRef.current === null) {
        timerEndTimeRef.current = Date.now() + timeLeft * 1000;
        // Send initial timer state to server
        updateTimer(timerEndTimeRef.current, mode);
      }
      
      // Use window.setInterval instead of setInterval to ensure proper typing
      intervalRef.current = window.setInterval(() => {
        const currentTime = Date.now();
        const endTime = timerEndTimeRef.current || currentTime;
        const secondsLeft = Math.max(0, Math.floor((endTime - currentTime) / 1000));
        
        setTimeLeft(secondsLeft);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // When timer ends
      if (settings.enableSound && audioRef.current) {
        audioRef.current.play().catch(err => console.error("Error playing sound:", err));
      }
      
      // Reset end time reference
      timerEndTimeRef.current = null;
      
      // Switch modes
      const nextMode = mode === 'focus' ? 'break' : 'focus';
      setMode(nextMode);
      
      // Set new time based on the mode
      const nextDuration = nextMode === 'focus' 
        ? settings.focusDuration * 60 
        : settings.breakDuration * 60;
      
      setTimeLeft(nextDuration);
      
      // Calculate and set new end time
      const newEndTime = Date.now() + nextDuration * 1000;
      timerEndTimeRef.current = newEndTime;
      
      // Update server with new timer state
      updateTimer(newEndTime, nextMode);
      
      // Notify the user
      toast(`Time's up! ${nextMode === 'focus' ? 'Focus time' : 'Break time'} started.`);
    } else if (!isActive) {
      // If timer is paused, clear the end time reference
      timerEndTimeRef.current = null;
      // Inform server timer is paused
      updateTimer(null, mode);
    }
    
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, timeLeft, mode, settings, updateTimer]);
  
  // Start/pause timer
  const toggleTimer = () => {
    if (!isActive) {
      // Starting the timer - calculate end time
      timerEndTimeRef.current = Date.now() + timeLeft * 1000;
      updateTimer(timerEndTimeRef.current, mode);
    } else {
      // Pausing the timer
      timerEndTimeRef.current = null;
      updateTimer(null, mode);
    }
    setIsActive(!isActive);
  };
  
  // Reset timer to current mode's full duration
  const resetTimer = () => {
    setIsActive(false);
    const newDuration = mode === 'focus' 
      ? settings.focusDuration * 60 
      : settings.breakDuration * 60;
    setTimeLeft(newDuration);
    timerEndTimeRef.current = null;
    updateTimer(null, mode);
  };
  
  // Manually change mode
  const toggleMode = () => {
    const nextMode = mode === 'focus' ? 'break' : 'focus';
    setMode(nextMode);
    setIsActive(false);
    const newDuration = nextMode === 'focus' 
      ? settings.focusDuration * 60 
      : settings.breakDuration * 60;
    setTimeLeft(newDuration);
    timerEndTimeRef.current = null;
    updateTimer(null, nextMode);
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
