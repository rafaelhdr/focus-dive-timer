import { timerEvents } from "@focusdive/timer";
import { getState } from "../state";
import { markTimerFinished } from "../commands";
import { playAlarm, AlarmSoundId } from "@focusdive/alarm";

export function registerTimerFinishedListener() {
  markTimerFinished(null);

  timerEvents.on("timer_finished", async ({ endsAt }) => {
    const s = getState();
    if (s.lastFinishedEndsAt === endsAt) return;
    await markTimerFinished(endsAt);

    playAlarm(s.alarmSound as AlarmSoundId, { volume: s.focusBeepVolume });
  });
}
