
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useTimerState } from './useTimerState';
import { useTimerSettings } from './useTimerSettings';
import { useTimerSound } from './useTimerSound';

export function useTimer() {
  const { settings, updateSettings, saveSoundSettings } = useTimerSettings();
  const { isActive, mode, timeLeft, toggleTimer, resetTimer, toggleMode } = useTimerState({
    focusDuration: settings.focusDuration,
    breakDuration: settings.breakDuration,
  });
  const { playSound } = useTimerSound(settings.enableSound, settings.volume);
  const prevTimeLeftRef = useRef(timeLeft);

  // Handle timer completion
  useEffect(() => {
    if (prevTimeLeftRef.current > 0 && timeLeft === 0) {
      // Play sound when timer completes
      playSound();
      
      // Notify the user
      const nextMode = mode === 'focus' ? 'break' : 'focus';
      toast(`Time's up! ${nextMode === 'focus' ? 'Focus time' : 'Break time'} started.`);
    }
    
    prevTimeLeftRef.current = timeLeft;
  }, [timeLeft, mode, playSound]);

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
    isLoading: false,
    formattedTime: formatTime(timeLeft),
    toggleTimer,
    resetTimer,
    toggleMode,
    updateSettings,
    saveSoundSettings,
  };
}
