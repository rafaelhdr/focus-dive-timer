import { TimerMode } from "@focusdive/timer";

export type TimerSyncMessage = {
  type: "TIMER/SYNC_BACKGROUND";
  endsAt: number;
  mode: TimerMode;
  remainingTime: number;
  isRunning: boolean;
  focusBeepEnabled: boolean;
  focusBeepVolume: number;
  alarmSound: string;
  autostartFocus: boolean;
  autostartBreak: boolean;
  defaultFocusDuration: number;
  defaultBreakDuration: number;
};

export type ExtensionMessage = TimerSyncMessage;
