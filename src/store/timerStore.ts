
import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { API_URL } from "@/config/env";
import { TimerData } from "@/hooks/types";
import { getAccessToken } from "@/services/authApi";
import { triggerTimerEvent, fetchPreferences, savePreferences } from "@/services/api";
import { toast } from "sonner";

interface TimerSettings {
  focusDuration: number; // in minutes
  breakDuration: number; // in minutes
  enableSound: boolean;
  volume: number; // Sound volume (0 to 1)
  alarmSound: string; // ID of the alarm sound
  autostartBreak: boolean; // Autostart break after focus
  autostartFocus: boolean; // Autostart focus after break
}

interface TimerState {
  // Timer state
  isActive: boolean;
  mode: "focus" | "break";
  timeLeft: number; // in seconds
  timerEndTime: number | null;

  // Settings
  settings: TimerSettings;
  isLoading: boolean;

  // Socket state
  socket: Socket | null;
  isSocketConnected: boolean;

  // Methods for timer control
  toggleTimer: () => void;
  resetTimer: () => void;
  toggleMode: () => void;
  formatTime: (timeInSeconds: number) => string;

  // Methods for settings
  updateSettings: (newSettings: Partial<TimerSettings>) => void;
  saveSoundSettings: (enableSound: boolean, volume: number, alarmSound: string) => Promise<void>;
  saveTimerSettings: (autostartBreak: boolean, autostartFocus: boolean) => Promise<void>;
  loadSettings: () => Promise<void>;
  
  // Socket methods
  initSocket: () => void;
  updateTimerOnServer: (timerEndsAt: number | null, mode: "focus" | "break", isRunning: boolean) => void;
  resetTimerOnServer: () => void;
}

// Helper function to get the duration based on the current mode
const getDurationInSeconds = (
  mode: "focus" | "break",
  settings: TimerSettings
): number => {
  return mode === "focus"
    ? settings.focusDuration * 60
    : settings.breakDuration * 60;
};

// Create the Zustand store
export const useTimerStore = create<TimerState>((set, get) => {
  // Interval reference for timer countdown
  let intervalRef: number | null = null;
  
  return {
    // Initial state
    isActive: false,
    mode: "focus",
    timeLeft: 25 * 60, // Default: 25 minutes in seconds
    timerEndTime: null,
    
    // Settings with defaults
    settings: {
      focusDuration: 25,
      breakDuration: 5,
      enableSound: true,
      volume: 1,
      alarmSound: "minimalistic",
      autostartBreak: true,
      autostartFocus: true,
    },
    isLoading: false,
    
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
              // Clear any existing interval
              if (intervalRef !== null) {
                clearInterval(intervalRef);
              }
              
              // Start new interval
              intervalRef = window.setInterval(() => {
                const state = get();
                const currentTime = Date.now();
                const endTime = state.timerEndTime || currentTime;
                const secondsLeft = Math.max(0, Math.floor((endTime - currentTime) / 1000));
                
                set({ timeLeft: secondsLeft });
                
                // Handle timer completion
                if (secondsLeft === 0 && state.isActive) {
                  // Clear interval
                  if (intervalRef !== null) {
                    clearInterval(intervalRef);
                    intervalRef = null;
                  }
                  
                  // Play sound if enabled
                  if (state.settings.enableSound) {
                    const audioElement = new Audio(`/alarm-beeps/${state.settings.alarmSound}.mp3`);
                    audioElement.volume = state.settings.volume;
                    audioElement.play().catch(err => console.error("Error playing sound:", err));
                  }
                  
                  // Determine next mode
                  const nextMode = state.mode === "focus" ? "break" : "focus";
                  
                  // Notify the user
                  toast(`Time's up! ${nextMode === "focus" ? "Focus time" : "Break time"} started.`);
                  
                  // Handle auto-switching based on settings
                  if ((state.mode === "focus" && state.settings.autostartBreak) || 
                      (state.mode === "break" && state.settings.autostartFocus)) {
                    // Auto-start the next timer
                    const newMode = nextMode;
                    const newDuration = getDurationInSeconds(newMode, state.settings);
                    const newEndTime = Date.now() + newDuration * 1000 + 1000; // Add 1s buffer
                    
                    // Update state
                    set({ 
                      mode: newMode,
                      timeLeft: newDuration,
                      timerEndTime: newEndTime,
                      isActive: true
                    });
                    
                    // Update server
                    get().updateTimerOnServer(newEndTime, newMode, true);
                    
                    // Trigger API event
                    triggerTimerEvent("start", newMode === "focus" ? "focus" : "relax")
                      .catch(err => console.error("Failed to trigger timer start:", err));
                      
                    // Start new interval
                    intervalRef = window.setInterval(() => {
                      const state = get();
                      const currentTime = Date.now();
                      const endTime = state.timerEndTime || currentTime;
                      const secondsLeft = Math.max(0, Math.floor((endTime - currentTime) / 1000));
                      
                      set({ timeLeft: secondsLeft });
                      
                      // Handle subsequent timer completions
                      if (secondsLeft === 0 && state.isActive) {
                        // This will be handled in the next iteration
                        clearInterval(intervalRef);
                        intervalRef = null;
                      }
                    }, 1000);
                  } else {
                    // Just switch mode without starting timer
                    const newMode = nextMode;
                    const newDuration = getDurationInSeconds(newMode, state.settings);
                    
                    set({ 
                      mode: newMode,
                      timeLeft: newDuration,
                      timerEndTime: null,
                      isActive: false
                    });
                    
                    // Update server
                    get().updateTimerOnServer(null, newMode, false);
                  }
                }
              }, 1000);
            }
          } else {
            // If no end time is provided, just set the default duration
            const duration = getDurationInSeconds(data.mode || "focus", get().settings);
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
          } else {
            // If timer is stopped, clear interval
            if (intervalRef !== null) {
              clearInterval(intervalRef);
              intervalRef = null;
            }
            
            set({ timerEndTime: null });
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
      get().updateTimerOnServer(null, "focus", false);
    },
    
    // Toggle timer (start/pause)
    toggleTimer: () => {
      const state = get();
      
      // If socket not connected, try to connect
      if (!state.socket) {
        get().initSocket();
      }
      
      // Clear any existing interval
      if (intervalRef !== null) {
        clearInterval(intervalRef);
        intervalRef = null;
      }
      
      if (!state.isActive) {
        // Starting the timer
        const newEndTime = Date.now() + (state.timeLeft * 1000) + 1000; // Add 1s buffer
        
        // Update state
        set({
          isActive: true,
          timerEndTime: newEndTime,
        });
        
        // Update server
        get().updateTimerOnServer(newEndTime, state.mode, true);
        
        // Trigger API event
        triggerTimerEvent("start", state.mode === "focus" ? "focus" : "relax")
          .catch(err => console.error("Failed to trigger timer start:", err));
        
        // Start countdown interval
        intervalRef = window.setInterval(() => {
          const currentState = get();
          const currentTime = Date.now();
          const endTime = currentState.timerEndTime || currentTime;
          const secondsLeft = Math.max(0, Math.floor((endTime - currentTime) / 1000));
          
          // Update time left
          set({ timeLeft: secondsLeft });
          
          // Update document title
          const focusType = currentState.mode === "focus" ? "Focus" : "Break";
          document.title = `${get().formatTime(secondsLeft)} ${focusType}`;
          
          // Handle timer completion
          if (secondsLeft === 0 && currentState.isActive) {
            // This will be handled in the next iteration
            clearInterval(intervalRef);
            intervalRef = null;
          }
        }, 1000);
      } else {
        // Pausing the timer
        
        // Trigger API event
        triggerTimerEvent("stop", state.mode === "focus" ? "focus" : "relax")
          .catch(err => console.error("Failed to trigger timer stop:", err));
        
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
      
      // If timer is active, trigger stop event
      if (state.isActive) {
        triggerTimerEvent("stop", state.mode === "focus" ? "focus" : "relax")
          .catch(err => console.error("Failed to trigger timer stop:", err));
      }
      
      // Clear any existing interval
      if (intervalRef !== null) {
        clearInterval(intervalRef);
        intervalRef = null;
      }
      
      // Calculate new duration based on current mode
      const newDuration = getDurationInSeconds(state.mode, state.settings);
      
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
      
      // If timer is active, trigger stop event
      if (state.isActive) {
        triggerTimerEvent("stop", state.mode === "focus" ? "focus" : "relax")
          .catch(err => console.error("Failed to trigger timer stop:", err));
          
        // Clear any existing interval
        if (intervalRef !== null) {
          clearInterval(intervalRef);
          intervalRef = null;
        }
      }
      
      // Switch mode
      const newMode = state.mode === "focus" ? "break" : "focus";
      
      // Calculate new duration
      const newDuration = getDurationInSeconds(newMode, state.settings);
      
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
    
    // Update settings
    updateSettings: (newSettings) => {
      set((state) => ({
        settings: {
          ...state.settings,
          ...newSettings,
        }
      }));
      
      // If we update duration settings, also update timeLeft if timer is not active
      const state = get();
      if (!state.isActive) {
        const newDuration = getDurationInSeconds(state.mode, {
          ...state.settings,
          ...newSettings,
        });
        set({ timeLeft: newDuration });
      }
    },
    
    // Load settings from API
    loadSettings: async () => {
      set({ isLoading: true });
      
      try {
        console.log("Loading preferences from API...");
        const preferences = await fetchPreferences();
        console.log("Got preferences:", preferences);
        
        set((state) => ({
          settings: {
            ...state.settings,
            enableSound: preferences.focus_beep_enabled,
            volume: preferences.focus_beep_volume / 100, // Convert from 0-100 to 0-1
            alarmSound: state.settings.alarmSound || "minimalistic",
            autostartBreak: preferences.autostart_break !== undefined 
              ? preferences.autostart_break 
              : true,
            autostartFocus: preferences.autostart_focus !== undefined 
              ? preferences.autostart_focus 
              : true,
          }
        }));
      } catch (error) {
        console.error("Failed to load preferences:", error);
        toast.error("Failed to load preferences");
      } finally {
        set({ isLoading: false });
      }
    },
    
    // Save sound settings to API
    saveSoundSettings: async (enableSound, volume, alarmSound) => {
      set({ isLoading: true });
      
      try {
        console.log("Saving sound settings:", { enableSound, volume, alarmSound });
        const success = await savePreferences({
          focus_beep_enabled: enableSound,
          focus_beep_volume: Math.round(volume * 100), // Convert from 0-1 to 0-100
          alarm_sound: alarmSound,
          // Include autostart settings from current state to avoid overwriting them
          autostart_break: get().settings.autostartBreak,
          autostart_focus: get().settings.autostartFocus
        });
        
        if (success) {
          toast.success("Sound settings saved");
          
          // Update local settings to ensure consistency
          set((state) => ({
            settings: {
              ...state.settings,
              enableSound,
              volume,
              alarmSound,
            }
          }));
        } else {
          toast.error("Failed to save settings");
        }
      } catch (error) {
        toast.error("Error saving settings");
        console.error("Error saving sound settings:", error);
      } finally {
        set({ isLoading: false });
      }
    },
    
    // Save timer settings to API
    saveTimerSettings: async (autostartBreak, autostartFocus) => {
      set({ isLoading: true });
      
      try {
        console.log("Saving timer settings:", { autostartBreak, autostartFocus });
        const success = await savePreferences({
          // Include current sound settings to avoid overwriting them
          focus_beep_enabled: get().settings.enableSound,
          focus_beep_volume: Math.round(get().settings.volume * 100),
          alarm_sound: get().settings.alarmSound,
          // Add the autostart settings
          autostart_break: autostartBreak,
          autostart_focus: autostartFocus,
        });
        
        if (success) {
          toast.success("Timer settings saved");
          
          // Update local settings to ensure consistency
          set((state) => ({
            settings: {
              ...state.settings,
              autostartBreak,
              autostartFocus,
            }
          }));
        } else {
          toast.error("Failed to save settings");
        }
      } catch (error) {
        toast.error("Error saving settings");
        console.error("Error saving timer settings:", error);
      } finally {
        set({ isLoading: false });
      }
    }
  };
});
