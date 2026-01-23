import { TimerMode } from "@focusdive/timer";

export type TimerSyncPayload = {
  endsAt: number | null;
  mode: TimerMode;
  remainingTime: number | null;
  isRunning: boolean;

  focusBeepEnabled: boolean;
  focusBeepVolume: number;
  alarmSound: string;

  autostartFocus: boolean;
  autostartBreak: boolean;
  defaultFocusDuration: number;
  defaultBreakDuration: number;
};

export type TimerSyncMessage = {
  type: "TIMER/SYNC_BACKGROUND";
} & TimerSyncPayload;

export type ExtensionMessage = TimerSyncMessage;
