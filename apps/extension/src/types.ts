export type Mode = "focus" | "break";

export type TimerSetEndsAtMessage = {
  type: "TIMER/SET_ENDS_AT";
  endsAt: number | null;
  mode?: Mode;
};

export type ExtensionMessage = TimerSetEndsAtMessage;
