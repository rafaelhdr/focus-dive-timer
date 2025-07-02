
import { create } from "zustand";
import { TimerData } from "@/hooks/types";
import { toast } from "sonner";
import { useSettingsStore } from "./settingsStore";
import { useSpotifyStore } from "./spotifyStore";
import { analytics } from "@/utils/analytics";
import { timerSocketService } from "@/services/timerSocketService";
import { wakeLockService } from "@/services/wakeLockService";

const TEST_TIMER = false; // Set to true for testing purposes

interface TimerState {
  // Timer state
  isActive: boolean;
  mode: "focus" | "break";
  timeLeft: number; // in seconds
  timerEndTime: number | null;

  // Socket state
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

// Helper function to handle Spotify playback based on timer mode
const handleSpotifyPlayback = async (mode: "focus" | "break") => {
  let spotifyStore = useSpotifyStore.getState();
  
  // Load Spotify settings if not already loaded
  if (!spotifyStore.spotifyEnabled && !spotifyStore.focusPlaylist && !spotifyStore.breakPlaylist) {
    console.log('Loading Spotify settings...');
    await spotifyStore.loadSpotifySettings();
    // Get fresh state after loading settings
    spotifyStore = useSpotifyStore.getState();
  }
  
  // Check if Spotify integration is enabled
  if (!spotifyStore.spotifyEnabled) {
    console.log('Spotify integration is disabled');
    return;
  }

  // Initialize Spotify player if not ready
  if (!spotifyStore.isReady && !spotifyStore.isInitializing) {
    console.log('Initializing Spotify player...');
    await spotifyStore.initialize();
    // Wait a moment for initialization to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Get fresh state after initialization
    spotifyStore = useSpotifyStore.getState();
  }

  // Check if Spotify player is ready
  if (!spotifyStore.isReady) {
    console.log('Spotify player is not ready');
    return;
  }

  let playlistToLoad = null;

  if (mode === "focus") {
    // For focus mode, use focus playlist
    playlistToLoad = spotifyStore.focusPlaylist;
  } else {
    // For break mode, check if we should keep focus sound or use break playlist
    if (spotifyStore.breakKeepFocusSound) {
      // Keep focus music during breaks - don't change playlist
      console.log('Keeping focus music during break');
      try {
        // Just resume playback if paused
        const currentState = spotifyStore.playerState;
        if (currentState && !currentState.isPlaying) {
          await spotifyStore.togglePlayback();
        }
      } catch (error) {
        console.error('Error resuming playback during break:', error);
      }
      return;
    } else {
      // Use break playlist if configured
      playlistToLoad = spotifyStore.breakPlaylist;
    }
  }

  if (playlistToLoad && playlistToLoad.id) {
    try {
      console.log(`Loading ${mode} playlist:`, playlistToLoad.name);
      // Pass the full playlist object instead of just the ID
      await spotifyStore.loadPlaylist(playlistToLoad);
    } catch (error) {
      console.error(`Error loading ${mode} playlist:`, error);
      toast.error(`Failed to load ${mode} playlist`);
    }
  } else {
    console.log(`No ${mode} playlist configured`);
  }
};

// Create the Zustand store
export const useTimerStore = create<TimerState>((set, get) => {
  // Interval reference for timer countdown
  let intervalRef: number | null = null;

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

      // Handle Spotify playback for auto-started timer
      handleSpotifyPlayback(nextMode);
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
      wakeLockService.deactivateWakeLock();
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

  // Socket event handlers
  const handleTimerState = (data: TimerData) => {
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
  };

  const handleTimerUpdated = (data: TimerData) => {
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
  };
  
  // Store reference to resetTimerOnServer to avoid get() calls
  const resetTimerOnServerRef = () => {
    timerSocketService.resetTimer();
    timerSocketService.updateTimer(null, "focus", false);
  };
  
  return {
    // Initial state
    isActive: false,
    mode: "focus",
    timeLeft: 25 * (TEST_TIMER ? 1 : 60), // Default to 25 minutes in seconds
    timerEndTime: null,
    
    // Socket state
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
      const socket = timerSocketService.initialize({
        onConnected: () => {
          set({ isSocketConnected: true });
        },
        onDisconnected: () => {
          set({ isSocketConnected: false });
        },
        onConnectionError: () => {
          set({ isSocketConnected: false });
        },
        onTimerState: handleTimerState,
        onTimerUpdated: handleTimerUpdated,
      });
    },
    
    // Update timer on the server
    updateTimerOnServer: (timerEndsAt, mode, isRunning) => {
      timerSocketService.updateTimer(timerEndsAt, mode, isRunning);
    },
    
    // Reset timer on the server
    resetTimerOnServer: resetTimerOnServerRef,
    
    // Toggle timer (start/pause)
    toggleTimer: () => {
      const state = get();
      
      // If socket not connected, try to connect
      if (!timerSocketService.isConnected()) {
        get().initSocket();
      }
      
      if (!state.isActive) {
        // Starting the timer
        const newEndTime = Date.now() + (state.timeLeft * 1000) + 1000; // Add 1s buffer
        
        // Track timer start
        analytics.timerStarted(state.mode, state.timeLeft);
        
        // Activate wake lock when starting timer
        wakeLockService.activateWakeLock();
        
        // Update state
        set({
          isActive: true,
          timerEndTime: newEndTime,
        });
        
        // Update server
        get().updateTimerOnServer(newEndTime, state.mode, true);
        
        // Start countdown interval
        startTimerInterval();

        // Handle Spotify playback when timer starts
        handleSpotifyPlayback(state.mode);
      } else {
        // Pausing the timer
        
        // Track timer pause
        analytics.timerPaused(state.mode, state.timeLeft);
        
        // Deactivate wake lock when pausing timer
        wakeLockService.deactivateWakeLock();
        
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
    
    // Reset timer - Fixed to avoid infinite loop by not using get()
    resetTimer: () => {
      // Track timer reset and handle wake lock deactivation
      set((state) => {
        // Track timer reset
        analytics.timerReset(state.mode);
        
        // Deactivate wake lock when resetting timer
        wakeLockService.deactivateWakeLock();
        
        // Clear any existing interval
        if (intervalRef !== null) {
          clearInterval(intervalRef);
          intervalRef = null;
        }
        
        // Calculate new duration based on current mode
        const newDuration = getDurationInSeconds(state.mode);
        
        // Reset document title
        document.title = "Focus Dive";
        
        // Return new state
        return {
          ...state,
          isActive: false,
          timeLeft: newDuration,
          timerEndTime: null,
        };
      });
      
      // Reset timer on server using direct reference (no get() call)
      resetTimerOnServerRef();
    },
    
    // Toggle between focus and break modes
    toggleMode: () => {
      const state = get();
      
      // Track mode toggle
      const newMode = state.mode === "focus" ? "break" : "focus";
      analytics.modeToggled(state.mode, newMode);
      
      // If timer is active, clear interval and deactivate wake lock
      if (state.isActive) {
        // Clear any existing interval
        if (intervalRef !== null) {
          clearInterval(intervalRef);
          intervalRef = null;
        }
        
        // Deactivate wake lock when stopping timer
        wakeLockService.deactivateWakeLock();
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
        wakeLockService.activateWakeLock();
        
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
          if (timerSocketService.isConnected()) {
            get().updateTimerOnServer(null, "focus", false);
          }
        }
        
        toast(`Added ${minutes} minutes to focus timer`);
      }
    },
  };
});
