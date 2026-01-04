
import { useTimerStore } from "./useTimerStore";

// This hook is being deprecated
export function useTimer() {
  const {
    settings,
    isLoading,
    updateSettings,
    saveSoundSettings,
    saveTimerSettings
  } = useTimerStore();

  return {
    settings,
    isLoading,
    updateSettings,
    saveSoundSettings,
    saveTimerSettings,
  };
}
