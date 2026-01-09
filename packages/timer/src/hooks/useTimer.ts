import { useEffect, useState } from "react";
import { useTimerStore } from "../store/timerStore";

function durationToMMSS(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function useTimer() {
  return useTimerStore((s) => ({
    mode: s.mode,
    isRunning: s.isRunning,
    endsAt: s.endsAt,
    remainingTime: s.remainingTime,
    pause: s.pause,
    reset: s.reset,
    setMode: s.setMode,
  }));
}

export function useTimerDisplay() {
  const endsAt = useTimerStore((s) => s.endsAt);
  const remainingTime = useTimerStore((s) => s.remainingTime);
  const mode = useTimerStore((s) => s.mode);
  const isRunning = useTimerStore((s) => s.isRunning);

  const [, forceTick] = useState(0);

  useEffect(() => {
    if (!endsAt || !isRunning) return;
    const id = window.setInterval(() => forceTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [endsAt, isRunning]);

  const ms =
    isRunning && endsAt ? Math.max(0, endsAt - Date.now()) : Math.max(0, remainingTime);

  const formattedTime = durationToMMSS(ms);

  return { mode, isRunning, formattedTime };
}
