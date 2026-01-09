import { useEffect } from "react";
import { useSettingsQuery } from "@focusdive/settings";
import { useTimerStore } from "@focusdive/timer";

export function useSettingsTimerBridge() {
  const { data: settings } = useSettingsQuery();

  useEffect(() => {
    if (!settings) return;

    useTimerStore.getState().applyConfig({
      focusMinutes: settings.defaultFocusDuration,
      breakMinutes: settings.defaultBreakDuration,
      autostartFocus: !!settings.autostartFocus,
      autostartBreak: !!settings.autostartBreak,
    });
  }, [settings]);
}

