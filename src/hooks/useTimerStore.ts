
import { useEffect, useRef } from "react";
import { useTimerStore as useTimerStoreRaw } from "@/store/timerStore";

// Custom hook to initialize the timer store and provide access to it
export function useTimerStore() {
  const isInitialized = useRef(false);
  
  // Select all the parts of the store we need
  const store = useTimerStoreRaw(state => state);
  
  // Initialize the store on first render
  useEffect(() => {
    if (!isInitialized.current) {
      console.log("Initializing timer store...");
      
      // Initialize WebSocket connection
      store.initSocket();
      
      // Load settings from API
      store.loadSettings();
      
      isInitialized.current = true;
    }
    
    return () => {
      // Reset document title on unmount
      document.title = "Focus Dive";
    };
  }, []);
  
  return store;
}
