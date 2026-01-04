export interface TimerData {
  mode: "focus" | "break";
  endsAt: number | null;
  remainingTime: number;
  isRunning: boolean;
}
