import { useEffect } from "react";
import { sendMessage } from "../browser";
import { useTimerStore } from "@focusdive/timer";
import { usePreferences } from "@focusdive/preferences";
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
  
  const { data: preferences } = usePreferences();

  useEffect(() => {
    if (!preferences) return;

    const message: TimerSyncMessage = {
      type: "TIMER/SYNC_BACKGROUND",
      endsAt,
      mode,
      isRunning,
      remainingTime,
      focusBeepEnabled: preferences.focusBeepEnabled,
      focusBeepVolume: preferences.focusBeepVolume,
      alarmSound: preferences.alarmSound,
      autostartFocus: preferences.autostartFocus,
      autostartBreak: preferences.autostartBreak,
      defaultFocusDuration: preferences.defaultFocusDuration,
      defaultBreakDuration: preferences.defaultBreakDuration,
    }
    sendMessage(message);
  }, [endsAt, mode, isRunning, remainingTime, preferences]);
}
