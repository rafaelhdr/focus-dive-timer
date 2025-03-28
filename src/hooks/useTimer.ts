
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

type TimerMode = 'focus' | 'break';

interface TimerSettings {
  focusDuration: number; // in minutes
  breakDuration: number; // in minutes
  enableSound: boolean;
}

export function useTimer() {
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // default 25 mins in seconds
  const [settings, setSettings] = useState<TimerSettings>({
    focusDuration: 25,
    breakDuration: 5,
    enableSound: true,
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  
  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio('/beep.mp3');
  }, []);
  
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
    formattedTime: formatTime(timeLeft),
    toggleTimer,
    resetTimer,
    toggleMode,
    updateSettings,
  };
}
