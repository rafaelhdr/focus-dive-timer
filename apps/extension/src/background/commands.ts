import { setState } from "./state";
import { type TimerSyncPayload } from "../types";

export async function applyTimerSync(synced: TimerSyncPayload) {
  await setState({
    endsAt: synced.endsAt ?? null,
    mode: synced.mode ?? "focus",
    remainingTime: synced.remainingTime ?? null,
    isRunning: synced.isRunning ?? false,
    focusBeepEnabled: synced.focusBeepEnabled ?? false,
    focusBeepVolume: synced.focusBeepVolume ?? 50,
    alarmSound: synced.alarmSound ?? "default",
    autostartFocus: synced.autostartFocus ?? false,
    autostartBreak: synced.autostartBreak ?? false,
    defaultFocusDuration: synced.defaultFocusDuration ?? 25,
    defaultBreakDuration: synced.defaultBreakDuration ?? 5,
  });
}

export async function markTimerFinished(endsAt: number) {
  await setState({ lastFinishedEndsAt: endsAt });
}
