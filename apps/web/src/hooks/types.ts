
export interface TimerData {
  // Required properties
  mode: "focus" | "break";
  isRunning: boolean;

  // Optional properties
  remainingTime?: number;  // in seconds
  timerEndsAt?: number;    // Timestamp when timer will end
}
