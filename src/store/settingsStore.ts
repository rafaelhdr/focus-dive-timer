
import { create } from "zustand";
import { fetchPreferences, savePreferences } from "@/services/api";
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

interface SettingsState {
  // Settings
  settings: TimerSettings;
  isLoading: boolean;

  // Methods for settings
  updateSettings: (newSettings: Partial<TimerSettings>) => void;
  saveSoundSettings: (enableSound: boolean, volume: number, alarmSound: string) => Promise<void>;
  saveTimerSettings: (autostartBreak: boolean, autostartFocus: boolean) => Promise<void>;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()((set, get) => ({
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
  
  // Update settings
  updateSettings: (newSettings) => {
    set((state) => ({
      settings: {
        ...state.settings,
        ...newSettings,
      }
    }));
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
}));
