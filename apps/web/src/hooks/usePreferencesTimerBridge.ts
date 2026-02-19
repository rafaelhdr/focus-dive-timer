import { useEffect } from "react";
import { usePreferences } from "@focusdive/preferences";
import { useTimerStore } from "@focusdive/timer";

export function usePreferencesTimerBridge() {
  const { data: preferences } = usePreferences();

  useEffect(() => {
    if (!preferences) return;

    useTimerStore.getState().applyConfig({
      focusMinutes: preferences.defaultFocusDuration,
      breakMinutes: preferences.defaultBreakDuration,
      autostartFocus: !!preferences.autostartFocus,
      autostartBreak: !!preferences.autostartBreak,
    });
  }, [preferences]);
}

