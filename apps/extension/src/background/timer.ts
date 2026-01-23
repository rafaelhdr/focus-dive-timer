import type { TimerMode } from "@focusdive/timer";
import type { TimerSyncMessage } from "../types";

import { getState } from "./state";
import { startCountdown, stopCountdown } from "./service_worker";

export type SyncBackgroundArgs =
  | { source: "message"; message: Partial<TimerSyncMessage> }
  | { source: "boot" };

export type TimerSynced = {
  endsAt: number | null;
  mode: TimerMode;
  remainingTime: number | null;
};

export async function syncBackground(args: SyncBackgroundArgs): Promise<TimerSynced> {
  const current = getState();

  let endsAt = current.endsAt;
  let mode: TimerMode = current.mode ?? "focus";
  let remainingTime = current.remainingTime ?? null;

  if (args.source === "message") {
    const msg = args.message;

    endsAt = msg.endsAt ?? null;
    mode = (msg.mode as TimerMode) ?? "focus";
    remainingTime = msg.remainingTime ?? null;
  }

  if (endsAt) {
    startCountdown(endsAt, mode);
  } else {
    stopCountdown();
  }

  return { endsAt, mode, remainingTime };
}

