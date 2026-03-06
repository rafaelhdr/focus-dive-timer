export type TimerMode = "focus" | "break";

export interface TimerData {
  mode: TimerMode;
  endsAt: number | null;
  remainingTime: number | null;
  isRunning: boolean;
}

export interface TimerDataApi {
  mode: TimerMode;
  ends_at: number | null;
  remaining_time: number | null;
  is_running: boolean;
}
