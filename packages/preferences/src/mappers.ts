import type { Preferences, PreferencesApi } from "./types";

export function fromPreferencesApi(data: PreferencesApi): Preferences {
  return {
    focusBeepEnabled: data.focus_beep_enabled,
    focusBeepVolume: data.focus_beep_volume,
    alarmSound: data.alarm_sound,
    autostartBreak: data.autostart_break,
    autostartFocus: data.autostart_focus,
    defaultFocusDuration: data.default_focus_duration,
    defaultBreakDuration: data.default_break_duration,
  };
}

export function toPreferencesApiPatch(patch: Preferences): PreferencesApi {
  return {
    focus_beep_enabled: patch.focusBeepEnabled,
    focus_beep_volume: patch.focusBeepVolume,
    alarm_sound: patch.alarmSound,
    autostart_break: patch.autostartBreak,
    autostart_focus: patch.autostartFocus,
    default_focus_duration: patch.defaultFocusDuration,
    default_break_duration: patch.defaultBreakDuration,
  };
}
