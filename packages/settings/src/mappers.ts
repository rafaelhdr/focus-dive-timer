import type { Preferences, SettingsApi } from "./types";

export function fromSettingsApi(data: SettingsApi): Preferences {
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

export function toSettingsApiPatch(patch: Partial<Preferences>): Partial<SettingsApi> {
  const out: Partial<SettingsApi> = {};

  if ("focusBeepEnabled" in patch) out.focus_beep_enabled = patch.focusBeepEnabled!;
  if ("focusBeepVolume" in patch) out.focus_beep_volume = patch.focusBeepVolume!;
  if ("alarmSound" in patch) out.alarm_sound = patch.alarmSound!;
  if ("autostartBreak" in patch) out.autostart_break = patch.autostartBreak;
  if ("autostartFocus" in patch) out.autostart_focus = patch.autostartFocus;
  if ("defaultFocusDuration" in patch) out.default_focus_duration = patch.defaultFocusDuration;
  if ("defaultBreakDuration" in patch) out.default_break_duration = patch.defaultBreakDuration;

  return out;
}
