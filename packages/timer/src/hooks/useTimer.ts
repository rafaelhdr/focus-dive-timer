import { useEffect, useState } from "react";
import { useTimerStore } from "../store/timerStore";
import { timerEvents } from "../events/timerEvents";

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
    focusDuration: s.focusDuration / 60000,
    setFocusDuration: (minutes: number) => s.setFocusDuration(minutes),
    breakDuration: s.breakDuration / 60000,
    setBreakDuration: (minutes: number) => s.setBreakDuration(minutes),
    start: s.start,
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

export function useTimerEngine() {
  const endsAt = useTimerStore((s) => s.endsAt);
  const isRunning = useTimerStore((s) => s.isRunning);
  const finish = useTimerStore((s) => s.finish);

  useEffect(() => {
    if (!isRunning || !endsAt) return;

    const delay = Math.max(0, endsAt - Date.now());
    const id = window.setTimeout(() => finish(), delay);

    return () => window.clearTimeout(id);
  }, [isRunning, endsAt, finish]);
}

export function useTimerFinished() {
  const start = useTimerStore((s) => s.start);
  const reset = useTimerStore((s) => s.reset);
  const setMode = useTimerStore((s) => s.setMode);

  useEffect(() => {
    const timerFinished = timerEvents.on("timer_finished", ({ mode }) => {
      if (mode === "focus") {
        setMode("break");
      } else {
        setMode("focus");
      }

      reset();
      start();
    });

    return timerFinished;
  }, [reset, setMode]);
}

