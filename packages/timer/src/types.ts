export type TimerMode = "focus" | "break";

export interface TimerData {
  mode: TimerMode;
  endsAt: number | null;
  remainingTime: number;
  isRunning: boolean;
}
