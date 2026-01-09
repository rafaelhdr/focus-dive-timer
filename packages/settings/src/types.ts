export interface Settings {
  focusBeepEnabled: boolean;
  focusBeepVolume: number;
  alarmSound: string;
  autostartBreak?: boolean;
  autostartFocus?: boolean;
  defaultFocusDuration?: number;
  defaultBreakDuration?: number;
}

export interface SettingsApi {
  focus_beep_enabled: boolean;
  focus_beep_volume: number;
  alarm_sound: string;
  autostart_break?: boolean;
  autostart_focus?: boolean;
  default_focus_duration?: number;
  default_break_duration?: number;
}
