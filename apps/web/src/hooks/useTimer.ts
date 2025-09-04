
import { useTimerStore } from "./useTimerStore";

// This hook is now a simple wrapper for useTimerStore
export function useTimer() {
  const {
    isActive,
    mode,
    timeLeft,
    settings,
    isLoading,
    formatTime,
    toggleTimer,
    resetTimer,
    toggleMode,
    addFocusMinutes,
    updateSettings,
    saveSoundSettings,
    saveTimerSettings
  } = useTimerStore();

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
    addFocusMinutes,
    updateSettings,
    saveSoundSettings,
    saveTimerSettings,
  };
}
