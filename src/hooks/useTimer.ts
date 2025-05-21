
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
    updateSettings,
    saveSoundSettings,
    saveTimerSettings,
    saveDefaultDurations
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
    updateSettings,
    saveSoundSettings,
    saveTimerSettings,
    saveDefaultDurations,
  };
}
