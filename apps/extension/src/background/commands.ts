import type { TimerMode } from "@focusdive/timer";
import { setState } from "./state";

export type TimerSynced = {
  endsAt: number | null;
  mode: TimerMode;
  remainingTime: number | null;
};

export async function applyTimerSync(synced: TimerSynced) {
  await setState({
    endsAt: synced.endsAt ?? null,
    mode: synced.mode ?? "focus",
    remainingTime: synced.remainingTime ?? null,
  });
}
