
import { useEffect, useRef } from "react";
import { useTimerStore as useTimerStoreRaw } from "@/store/timerStore";
import { useSettingsStore } from "@/store/settingsStore";

// Custom hook to initialize both timer stores and provide access to them
export function useTimerStore() {
  const isInitialized = useRef(false);
  
  // Select all the parts of the stores we need
  const timerStore = useTimerStoreRaw(state => state);
  const settingsStore = useSettingsStore(state => state);
  
  // Initialize the stores on first render
  useEffect(() => {
    if (!isInitialized.current) {
      console.log("Initializing timer stores...");
      
      // Initialize WebSocket connection
      timerStore.initSocket();
      
      // Load settings from API
      settingsStore.loadSettings();
      
      isInitialized.current = true;
    }
    
    return () => {
      // Reset document title on unmount
      document.title = "Focus Dive";
    };
  }, []);
  
  // Return combined timer store and settings store
  return {
    ...timerStore,
    settings: settingsStore.settings,
    isLoading: settingsStore.isLoading,
    updateSettings: settingsStore.updateSettings,
    saveSoundSettings: settingsStore.saveSoundSettings,
    saveTimerSettings: settingsStore.saveTimerSettings,
    saveDefaultDurations: settingsStore.saveDefaultDurations,
  };
}
