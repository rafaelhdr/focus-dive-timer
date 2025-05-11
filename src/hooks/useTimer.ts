
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useTimerState } from './useTimerState';
import { useTimerSettings } from './useTimerSettings';
import { useTimerSound } from './useTimerSound';

export function useTimer() {
  const { settings, updateSettings, saveSoundSettings } = useTimerSettings();
  const { isActive, mode, timeLeft, toggleTimer, resetTimer, toggleMode, formatTime } = useTimerState({
    focusDuration: settings.focusDuration,
    breakDuration: settings.breakDuration,
  });
  const { playSound } = useTimerSound(settings.enableSound, settings.volume, settings.alarmSound);
  const prevTimeLeftRef = useRef(timeLeft);

  // Handle timer completion
  useEffect(() => {
    if (prevTimeLeftRef.current > 0 && timeLeft === 0) {
      // Play sound when timer completes
      playSound();
      
      // Notify the user
      const nextMode = mode === 'focus' ? 'break' : 'focus';
      toast(`Time's up! ${nextMode === 'focus' ? 'Focus time' : 'Break time'} started.`);
      toggleTimer();
      toggleMode();
    }
    
    prevTimeLeftRef.current = timeLeft;
  }, [timeLeft, mode, playSound]);
  
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
