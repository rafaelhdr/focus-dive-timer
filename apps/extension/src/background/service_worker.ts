import { formatRemainingTime, type TimerMode } from "@focusdive/timer";
import { clearBadge, setBadge } from "../libs/badge";
import { timerEvents } from "@focusdive/timer";

let intervalId: number | null = null;
let endsAt: number | null = null;
let mode: TimerMode = "focus";

async function tick() {
  if (!endsAt) {
    await clearBadge();
    stopCountdown();
    return;
  }

  const text = formatRemainingTime({
    isRunning: true,
    endsAt,
    remainingTime: 0,
    format: "badge",
  });

  if (!text) {
    await clearBadge();
    timerEvents.emit("timer_finished", { mode, endsAt });
    stopCountdown();
    return;
  }

  await setBadge(text, mode);
}

export function startCountdown(nextEndsAt: number, nextMode: TimerMode) {
  stopCountdown();

  endsAt = nextEndsAt;
  mode = nextMode;

  void tick();

  intervalId = setInterval(() => {
    void tick();
  }, 1000) as unknown as number;
}

export function stopCountdown() {
  if (intervalId !== null) {
    clearBadge();
    clearInterval(intervalId);
    intervalId = null;
  }

  endsAt = null;
}
