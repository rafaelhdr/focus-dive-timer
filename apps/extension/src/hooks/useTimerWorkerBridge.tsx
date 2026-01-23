import { useEffect } from "react";
import browser from "webextension-polyfill";
import { useTimerStore } from "@focusdive/timer";
import { useSettingsQuery } from "@focusdive/settings";
import { useShallow } from 'zustand/react/shallow'
import { type TimerSyncMessage } from "../types";

export function useTimerWorkerBridge() {
  const { mode, endsAt, isRunning, remainingTime } = useTimerStore(
    useShallow(
      (s) => ({
        mode: s.mode,
        endsAt: s.endsAt,
        isRunning: s.isRunning,
        remainingTime: s.remainingTime,
      }),
    ));
  
  const { data: settings } = useSettingsQuery();

  useEffect(() => {
    if (!settings) return;

    const message: TimerSyncMessage = {
      type: "TIMER/SYNC_BACKGROUND",
      endsAt,
      mode,
      isRunning,
      remainingTime,
      focusBeepEnabled: settings.focusBeepEnabled,
      focusBeepVolume: settings.focusBeepVolume,
      alarmSound: settings.alarmSound,
      autostartFocus: settings.autostartFocus,
      autostartBreak: settings.autostartBreak,
      defaultFocusDuration: settings.defaultFocusDuration,
      defaultBreakDuration: settings.defaultBreakDuration,
    }
    browser.runtime.sendMessage(message);
  }, [endsAt, mode, isRunning, remainingTime, settings]);
}
