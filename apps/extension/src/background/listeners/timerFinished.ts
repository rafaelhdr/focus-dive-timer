import { timerEvents, type TimerMode, updateTimer } from "@focusdive/timer";
import { getState } from "../state";
import { markTimerFinished, restartTimerStore } from "../commands";
import { playAlarm } from "../../browser";
import { syncBackgroundFromState } from "../timer";
import { type TimerSyncPayload } from "../../types";

const restartTimer = async (preferences: TimerSyncPayload, mode: TimerMode) => {
  if (mode === "focus") {
    if (!preferences.autostartBreak) return;

    const { endsAt } = await restartTimerStore("break", preferences.defaultBreakDuration);
    syncBackgroundFromState();
    updateTimer({ endsAt, mode: "break", isRunning: true, remainingTime: null });
    return;
  }

  if (mode === "break") {
    if (!preferences.autostartFocus) return;

    const { endsAt } = await restartTimerStore("focus", preferences.defaultFocusDuration);
    syncBackgroundFromState();
    updateTimer({ endsAt, mode: "focus", isRunning: true, remainingTime: null });
    return;
  }
}

export function registerTimerFinishedListener() {
  markTimerFinished(null);

  timerEvents.on("timer_finished", async ({ mode, endsAt }) => {
    const s = getState();
    if (s.lastFinishedEndsAt === endsAt) return;
    await markTimerFinished(endsAt);

    await playAlarm(s.alarmSound, { volume: s.focusBeepVolume });
    restartTimer(s, mode);
  });
}
