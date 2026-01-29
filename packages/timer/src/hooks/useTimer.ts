import { useEffect, useState } from "react";
import { useTimerStore } from "../store/timerStore";
import { timerEvents } from "../events/timerEvents";
import { useShallow } from 'zustand/react/shallow'

type TimerFinishedOptions = {
  autostartBreak: boolean;
  autostartFocus: boolean;
};

export type TimerFormat = "clock" | "badge";

type FormatArgs = {
  isRunning: boolean;
  endsAt: number | null;
  remainingTime: number | null;
  format: TimerFormat;
};

export function formatRemainingTime({
  isRunning,
  endsAt,
  remainingTime,
  format,
}: FormatArgs): string | null {
  const ms = isRunning && endsAt
    ? Math.max(0, endsAt - Date.now())
    : Math.max(0, remainingTime ?? 0);

  if (ms <= 0) return null;

  if (format === "clock") {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  // format === "badge"
  if (ms >= 60_000) {
    return String(Math.ceil(ms / 60_000));
  }
  return String(Math.floor(ms / 1000));
}

export function useTimer() {
  return useTimerStore(
    useShallow(
      (s) => ({
        mode: s.mode,
        isRunning: s.isRunning,

        focusDuration: s.focusDuration / 60000,
        breakDuration: s.breakDuration / 60000,
        setFocusDuration: s.setFocusDuration,
        setBreakDuration: s.setBreakDuration,
      }),
    ));
}

export function useTimerDisplay() {
  const { endsAt, remainingTime, mode, isRunning } = useTimerStore(
    useShallow((s) => ({
      endsAt: s.endsAt,
      remainingTime: s.remainingTime,
      mode: s.mode,
      isRunning: s.isRunning,
    })),
  );

  const [, forceTick] = useState(0);

  useEffect(() => {
    if (!endsAt || !isRunning) return;
    const id = window.setInterval(() => forceTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [endsAt, isRunning]);

  const formattedTime = formatRemainingTime({
    isRunning,
    endsAt,
    remainingTime,
    format: "clock",
  });

  return { mode, isRunning, formattedTime };
}

export function useTimerElapsedDetector() {
  const expectedMode = useTimerStore((s) => s.mode);
  const endsAt = useTimerStore((s) => s.endsAt);
  const isRunning = useTimerStore((s) => s.isRunning);
  const finish = useTimerStore((s) => s.finish);

  useEffect(() => {
    if (!isRunning || !endsAt) return;

    const delay = Math.max(0, endsAt - Date.now());
    const id = window.setTimeout(() => finish({expectedMode}), delay);

    return () => window.clearTimeout(id);
  }, [isRunning, endsAt, finish]);
}

export function useTimerFinished(opts: TimerFinishedOptions) {
  const { autostartBreak, autostartFocus } = opts;

  const start = useTimerStore((s) => s.start);
  const reset = useTimerStore((s) => s.reset);
  const setMode = useTimerStore((s) => s.setMode);

  useEffect(() => {
    const off = timerEvents.on("timer_finished", ({ mode }) => {
      const nextMode = mode === "focus" ? "break" : "focus";
      setMode(nextMode);

      reset();

      const shouldAutostart =
        nextMode === "break" ? autostartBreak : autostartFocus;

      if (shouldAutostart) start();
    });

    return off;
  }, [autostartBreak, autostartFocus, reset, setMode, start]);
}
