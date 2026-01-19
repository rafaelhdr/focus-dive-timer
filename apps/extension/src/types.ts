import { TimerMode } from "@focusdive/timer";

export type TimerSetEndsAtMessage = {
  type: "TIMER/SET_ENDS_AT";
  endsAt: number | null;
  mode?: TimerMode;
};

export type ExtensionMessage = TimerSetEndsAtMessage;
