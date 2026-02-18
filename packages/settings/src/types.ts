import { type AlarmSoundId } from "@focusdive/alarm";

export interface Preferences {
  focusBeepEnabled: boolean;
  focusBeepVolume: number;
  alarmSound: AlarmSoundId;
  autostartBreak: boolean;
  autostartFocus: boolean;
  defaultFocusDuration: number;
  defaultBreakDuration: number;
}

export interface SettingsApi {
  focus_beep_enabled: boolean;
  focus_beep_volume: number;
  alarm_sound: AlarmSoundId;
  autostart_break: boolean;
  autostart_focus: boolean;
  default_focus_duration: number;
  default_break_duration: number;
}
