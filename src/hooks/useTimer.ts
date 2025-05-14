
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useTimerState } from './useTimerState';
import { useTimerSettings } from './useTimerSettings';
import { useTimerSound } from './useTimerSound';

export function useTimer() {
  const { settings, updateSettings, saveSoundSettings, saveTimerSettings } = useTimerSettings();
  const { isActive, mode, timeLeft, toggleTimer, resetTimer, toggleMode, formatTime } = useTimerState({
    focusDuration: settings.focusDuration,
    breakDuration: settings.breakDuration,
    autostartBreak: settings.autostartBreak,
    autostartFocus: settings.autostartFocus,
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
      
      // Auto-toggle to next mode based on settings
      if ((mode === 'focus' && settings.autostartBreak) || (mode === 'break' && settings.autostartFocus)) {
        toggleTimer();
        toggleMode();
      } else {
        // Just toggle mode without starting the timer
        toggleMode();
      }
    }
    
    prevTimeLeftRef.current = timeLeft;
  }, [timeLeft, mode, playSound, settings.autostartBreak, settings.autostartFocus]);
  
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
    saveTimerSettings,
  };
}
