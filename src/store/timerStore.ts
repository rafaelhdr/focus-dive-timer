
import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { API_URL } from "@/config/env";
import { TimerData } from "@/hooks/types";
import { getAccessToken } from "@/services/authApi";
import { toast } from "sonner";
import { useSettingsStore } from "./settingsStore";
import { analytics } from "@/utils/analytics";

const TEST_TIMER = false; // Set to true for testing purposes

interface TimerState {
  // Timer state
  isActive: boolean;
  mode: "focus" | "break";
  timeLeft: number; // in seconds
  timerEndTime: number | null;

  // Socket state
  socket: Socket | null;
  isSocketConnected: boolean;

  // Methods for timer control
  toggleTimer: () => void;
  resetTimer: () => void;
  toggleMode: () => void;
  addFocusMinutes: (minutes: number) => void;
  formatTime: (timeInSeconds: number) => string;
  
  // Socket methods
  initSocket: () => void;
  updateTimerOnServer: (timerEndsAt: number | null, mode: "focus" | "break", isRunning: boolean) => void;
  resetTimerOnServer: () => void;
}

// Helper function to get the duration based on the current mode from settings
const getDurationInSeconds = (
  mode: "focus" | "break",
): number => {
  const { settings } = useSettingsStore.getState();
  const toMinutesMultiplier = TEST_TIMER ? 1 : 60;
  
  if (mode === "focus") {
    // Use the default focus duration from settings
    const duration = settings.focusDuration;
    return duration * toMinutesMultiplier;
  } else {
    // Use the default break duration from settings
    const duration = settings.breakDuration;
    return duration * toMinutesMultiplier;
  }
};

// Create the Zustand store
export const useTimerStore = create<TimerState>((set, get) => {
  // Interval reference for timer countdown
  let intervalRef: number | null = null;
  
  // Wake lock functionality
  let wakeLockSentinel: WakeLockSentinel | null = null;
  const isWakeLockSupported = 'wakeLock' in navigator;

  const requestWakeLock = async (): Promise<void> => {
    if (!isWakeLockSupported) {
      console.warn('Wake Lock API is not supported in this browser');
      return;
    }

    try {
      if (wakeLockSentinel && !wakeLockSentinel.released) {
        // Already have an active wake lock
        return;
      }

      wakeLockSentinel = await navigator.wakeLock.request('screen');
      console.log('Wake lock activated - screen will stay on during timer');
      
      // Listen for wake lock release
      wakeLockSentinel.addEventListener('release', () => {
        console.log('Wake lock was released');
        wakeLockSentinel = null;
      });
    } catch (error) {
      console.error('Failed to request wake lock:', error);
    }
  };

  const releaseWakeLock = async (): Promise<void> => {
    if (wakeLockSentinel && !wakeLockSentinel.released) {
      try {
        await wakeLockSentinel.release();
        wakeLockSentinel = null;
        console.log('Wake lock released - screen can now turn off');
      } catch (error) {
        console.error('Failed to release wake lock:', error);
      }
    }
  };

  // Handle page visibility changes
  const handleVisibilityChange = async () => {
    if (document.visibilityState === 'visible' && wakeLockSentinel?.released) {
      const state = get();
      // Reacquire wake lock if timer is still active
      if (state.isActive) {
        await requestWakeLock();
      }
    }
  };

  // Add event listener for visibility changes
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Cleanup function to remove event listeners and release wake lock
  const cleanup = () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    releaseWakeLock();
    if (intervalRef !== null) {
      clearInterval(intervalRef);
      intervalRef = null;
    }
  };

  // Helper function to handle timer completion
  const handleTimerCompletion = () => {
    // Clear the interval
    if (intervalRef !== null) {
      clearInterval(intervalRef);
      intervalRef = null;
    }
    
    const state = get();
    
    // Track timer completion
    analytics.timerCompleted(state.mode, getDurationInSeconds(state.mode));
    
    // Get settings for sound and autostart
    const { settings } = useSettingsStore.getState();
    
    // Play sound if enabled
    if (settings.enableSound) {
      const audioElement = new Audio(`/alarm-beeps/${settings.alarmSound}.mp3`);
      audioElement.volume = settings.volume;
      audioElement.play().catch(err => console.error("Error playing sound:", err));
    }
    
    // Determine next mode
    const nextMode = state.mode === "focus" ? "break" : "focus";
    
    // Notify the user
    toast(`Time's up! ${nextMode === "focus" ? "Focus time" : "Break time"} started.`);
    
    // Handle auto-switching based on settings
    if ((state.mode === "focus" && settings.autostartBreak) || 
        (state.mode === "break" && settings.autostartFocus)) {
      // Auto-start the next timer
      const newDuration = getDurationInSeconds(nextMode);
      const newEndTime = Date.now() + newDuration * 1000 + 1000; // Add 1s buffer
      
      // Track auto-start
      analytics.timerStarted(nextMode, newDuration);
      
      // Update state
      set({ 
        mode: nextMode,
        timeLeft: newDuration,
        timerEndTime: newEndTime,
        isActive: true
      });
      
      // Update server
      get().updateTimerOnServer(newEndTime, nextMode, true);
        
      // Start new interval
      startTimerInterval();
    } else {
      // Just switch mode without starting timer
      const newDuration = getDurationInSeconds(nextMode);
      
      set({ 
        mode: nextMode,
        timeLeft: newDuration,
        timerEndTime: null,
        isActive: false
      });
      
      // Update server
      get().updateTimerOnServer(null, nextMode, false);
      
      // Reset document title
      document.title = "Focus Dive";
      
      // Release wake lock when timer stops
      releaseWakeLock();
    }
  };
  
  // Helper function to start timer interval
  const startTimerInterval = () => {
    // Clear any existing interval first
    if (intervalRef !== null) {
      clearInterval(intervalRef);
      intervalRef = null;
    }
    
    // Start new interval
    intervalRef = window.setInterval(() => {
      const state = get();
      const currentTime = Date.now();
      const endTime = state.timerEndTime || currentTime;
      const secondsLeft = Math.max(0, Math.floor((endTime - currentTime) / 1000));
      
      // Update time left
      set({ timeLeft: secondsLeft });
      
      // Update document title
      const focusType = state.mode === "focus" ? "Focus" : "Break";
      document.title = `${state.formatTime(secondsLeft)} ${focusType}`;
      
      // Handle timer completion
      if (secondsLeft === 0 && state.isActive) {
        handleTimerCompletion();
      }
    }, 1000);
    
    return intervalRef;
  };
  
  return {
    // Initial state
    isActive: false,
    mode: "focus",
    timeLeft: 25 * (TEST_TIMER ? 1 : 60), // Default to 25 minutes in seconds
    timerEndTime: null,
    
    // Socket state
    socket: null,
    isSocketConnected: false,
    
    // Format time for display (mm:ss)
    formatTime: (timeInSeconds: number): string => {
      const minutes = Math.floor(timeInSeconds / 60);
      const seconds = timeInSeconds % 60;
      return `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    },
    
    // Initialize WebSocket connection
    initSocket: () => {
      const currentState = get();
      
      // Skip if socket already exists
      if (currentState.socket) return;
      
      console.log("Initializing WebSocket connection to:", `${API_URL}/timer`);
      
      try {
        // Get authentication token
        const accessToken = getAccessToken();
        
        // Create socket connection with token as query parameter
        const socket = io(`${API_URL}/timer`, {
          withCredentials: true,
          query: {
            token: accessToken
          }
        });
        
        socket.on("connect", () => {
          console.log("WebSocket connected successfully");
          set({ isSocketConnected: true });
          
          // Request current timer state from server
          socket.emit("get_timer");
        });
        
        socket.on("connect_error", (error) => {
          console.error("WebSocket connection error:", error);
          set({ isSocketConnected: false });
        });
        
        socket.on("disconnect", (reason) => {
          console.log("WebSocket disconnected:", reason);
          set({ isSocketConnected: false });
        });
        
        // Handle timer state from server
        socket.on("timer_state", (data: TimerData) => {
          console.log("Received timer state:", data);
          
          // Update local state based on server state
          if (data.mode) {
            set({ mode: data.mode });
          }
          
          set({ isActive: data.isRunning });
          
          if (data.timerEndsAt) {
            const currentTime = Date.now();
            const endTime = data.timerEndsAt;
            const secondsLeft = Math.max(0, Math.floor((endTime - currentTime) / 1000));
            
            set({ 
              timeLeft: secondsLeft,
              timerEndTime: data.timerEndsAt
            });
            
            // Start the countdown if timer is active
            if (data.isRunning) {
              startTimerInterval();
            }
          } else {
            // If no end time is provided, just set the default duration
            const duration = getDurationInSeconds(data.mode || "focus");
            set({ timeLeft: duration });
          }
        });
        
        // Listen for timer updates from server
        socket.on("timer_updated", (data: TimerData) => {
          console.log("Received timer update:", data);
          
          // Similar logic as timer_state handler
          if (data.mode) {
            set({ mode: data.mode });
          }
          
          set({ isActive: data.isRunning });
          
          if (data.timerEndsAt) {
            const currentTime = Date.now();
            const endTime = data.timerEndsAt;
            const secondsLeft = Math.max(0, Math.floor((endTime - currentTime) / 1000));
            
            set({ 
              timeLeft: secondsLeft,
              timerEndTime: data.timerEndsAt
            });
            
            // Start interval if timer is active
            if (data.isRunning) {
              startTimerInterval();
            }
          } else {
            // If timer is stopped, clear interval
            if (intervalRef !== null) {
              clearInterval(intervalRef);
              intervalRef = null;
            }
            
            set({ timerEndTime: null });
            
            // Reset document title
            document.title = "Focus Dive";
          }
        });
        
        // Save socket to state
        set({ socket });
      } catch (error) {
        console.error("Error initializing socket:", error);
      }
    },
    
    // Update timer on the server
    updateTimerOnServer: (timerEndsAt, mode, isRunning) => {
      const { socket } = get();
      
      if (!socket) {
        console.warn("Cannot update timer: WebSocket not connected");
        return;
      }
      
      console.log("Updating timer on server:", { timerEndsAt, mode, isRunning });
      socket.emit("timer_data", {
        timerEndsAt,
        mode,
        isRunning,
      });
    },
    
    // Reset timer on the server
    resetTimerOnServer: () => {
      const { socket } = get();
      
      if (!socket) {
        console.warn("Cannot reset timer: WebSocket not connected");
        return;
      }
      
      console.log("Resetting timer on server");
      socket.emit("reset_timer");
      
      // Also update with explicit null values to ensure reset
      const { mode, updateTimerOnServer } = get();
      updateTimerOnServer(null, mode, false);
    },
    
    // Toggle timer (start/pause)
    toggleTimer: () => {
      const state = get();
      
      // If socket not connected, try to connect
      if (!state.socket) {
        get().initSocket();
      }
      
      if (!state.isActive) {
        // Starting the timer
        const newEndTime = Date.now() + (state.timeLeft * 1000) + 1000; // Add 1s buffer
        
        // Track timer start
        analytics.timerStarted(state.mode, state.timeLeft);
        
        // Request wake lock when starting timer
        requestWakeLock();
        
        // Update state
        set({
          isActive: true,
          timerEndTime: newEndTime,
        });
        
        // Update server
        get().updateTimerOnServer(newEndTime, state.mode, true);
        
        // Start countdown interval
        startTimerInterval();
      } else {
        // Pausing the timer
        
        // Track timer pause
        analytics.timerPaused(state.mode, state.timeLeft);
        
        // Release wake lock when pausing timer
        releaseWakeLock();
        
        // Clear interval
        if (intervalRef !== null) {
          clearInterval(intervalRef);
          intervalRef = null;
        }
        
        // Update state
        set({
          isActive: false,
          timerEndTime: null,
        });
        
        // Update server
        get().updateTimerOnServer(null, state.mode, false);
        
        // Reset document title
        document.title = "Focus Dive";
      }
    },
    
    // Reset timer
    resetTimer: () => {
      const state = get();
      
      // Track timer reset
      analytics.timerReset(state.mode);
      
      // Release wake lock when resetting timer
      releaseWakeLock();
      
      // Clear any existing interval
      if (intervalRef !== null) {
        clearInterval(intervalRef);
        intervalRef = null;
      }
      
      // Calculate new duration based on current mode
      const newDuration = getDurationInSeconds(state.mode);
      
      // Update state
      set({
        isActive: false,
        timeLeft: newDuration,
        timerEndTime: null,
      });
      
      // Reset document title
      document.title = "Focus Dive";
      
      // Reset timer on server
      get().resetTimerOnServer();
    },
    
    // Toggle between focus and break modes
    toggleMode: () => {
      const state = get();
      
      // Track mode toggle
      const newMode = state.mode === "focus" ? "break" : "focus";
      analytics.modeToggled(state.mode, newMode);
      
      // If timer is active, clear interval
      if (state.isActive) {
        // Clear any existing interval
        if (intervalRef !== null) {
          clearInterval(intervalRef);
          intervalRef = null;
        }
      }
      
      // Calculate new duration
      const newDuration = getDurationInSeconds(newMode);
      
      // Update state
      set({
        mode: newMode,
        isActive: false,
        timeLeft: newDuration,
        timerEndTime: null,
      });
      
      // Reset document title
      document.title = "Focus Dive";
      
      // Update server
      get().updateTimerOnServer(null, newMode, false);
    },
    
    // Add focus minutes function
    addFocusMinutes: (minutes: number) => {
      const state = get();
      const additionalSeconds = minutes * (TEST_TIMER ? 1 : 60);
      
      // Track the action
      analytics.settingsChanged('add_focus_minutes', minutes);
      
      if (state.mode === "break") {
        // Switch to focus mode with the added minutes and start the timer
        const newDuration = additionalSeconds;
        const newEndTime = Date.now() + (newDuration * 1000) + 1000; // Add 1s buffer
        
        // Clear any existing interval if timer was running
        if (intervalRef !== null) {
          clearInterval(intervalRef);
          intervalRef = null;
        }
        
        // Track timer start
        analytics.timerStarted("focus", newDuration);
        
        // Request wake lock when starting timer
        requestWakeLock();
        
        set({
          mode: "focus",
          timeLeft: newDuration,
          isActive: true,
          timerEndTime: newEndTime
        });
        
        // Update server
        get().updateTimerOnServer(newEndTime, "focus", true);
        
        // Start countdown interval
        startTimerInterval();
        
        toast(`Switched to focus mode with ${minutes} minutes and started timer`);
      } else {
        // Add minutes to current focus timer
        const newTimeLeft = state.timeLeft + additionalSeconds;
        
        if (state.isActive && state.timerEndTime) {
          // If timer is running, extend the end time
          const newEndTime = state.timerEndTime + (additionalSeconds * 1000);
          
          set({
            timeLeft: newTimeLeft,
            timerEndTime: newEndTime
          });
          
          // Update server
          get().updateTimerOnServer(newEndTime, "focus", true);
        } else {
          // If timer is paused, just add to the time left
          set({
            timeLeft: newTimeLeft
          });
          
          // Update server if needed
          if (state.socket) {
            get().updateTimerOnServer(null, "focus", false);
          }
        }
        
        toast(`Added ${minutes} minutes to focus timer`);
      }
    },
  };
});
