import { useEffect } from "react";
import { sendMessage } from "../browser";
import { useTimerStore } from "@focusdive/timer";
import { usePreferences } from "@focusdive/settings";
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
  
  const { data: settings } = usePreferences();

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
    sendMessage(message);
  }, [endsAt, mode, isRunning, remainingTime, settings]);
}
