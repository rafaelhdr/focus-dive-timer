import { timerEvents, type TimerMode } from "@focusdive/timer";
import { getState } from "../state";
import { markTimerFinished, restartTimerStore } from "../commands";
import { playAlarm, AlarmSoundId } from "@focusdive/alarm";
import { syncBackgroundFromState } from "../timer";
import { type TimerSyncPayload } from "../../types";

const restartTimer = async (settings: TimerSyncPayload, mode: TimerMode) => {
  if (mode === "focus") {
    if (!settings.autostartBreak) return;

    await restartTimerStore("break", settings.defaultBreakDuration);
    syncBackgroundFromState();
    return;
  }

  if (mode === "break") {
    if (!settings.autostartFocus) return;

    await restartTimerStore("focus", settings.defaultFocusDuration);
    syncBackgroundFromState();
    return;
  }
}

export function registerTimerFinishedListener() {
  markTimerFinished(null);

  timerEvents.on("timer_finished", async ({ mode, endsAt }) => {
    const s = getState();
    if (s.lastFinishedEndsAt === endsAt) return;
    await markTimerFinished(endsAt);

    playAlarm(s.alarmSound as AlarmSoundId, { volume: s.focusBeepVolume });
    restartTimer(s, mode);
  });
}
