import { TimerMode } from "@focusdive/timer";

export type TimerSyncMessage = {
  type: "TIMER/SYNC_BACKGROUND";
  endsAt: number;
  mode: TimerMode;
  remainingTime: number;
};

export type ExtensionMessage = TimerSyncMessage;
