import type { TimerState } from "./state";
import { getState } from "./state";
import { updateBadgeFromState } from "./badge";
import { desiredTickMs } from "./badge/format";

let intervalId: number | null = null;
let currentTickMs: number | null = null;

function stop() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
  currentTickMs = null;
  updateBadgeFromState(getState());
}

async function tickOnce() {
  const state = getState();
  const res = await updateBadgeFromState(state);

  // If timer finished or cleared, stop ticking.
  if (res.done) {
    stop();
    return;
  }

  // Adjust interval if we crossed the 60s boundary.
  const nextTick = desiredTickMs(res.ms);
  if (currentTickMs !== nextTick) {
    startOrReschedule(nextTick);
  }
}

function startOrReschedule(tickMs: number) {
  if (intervalId !== null && currentTickMs === tickMs) return;

  stop();
  currentTickMs = tickMs;
  intervalId = setInterval(() => {
    // fire and forget; errors should not kill the loop
    void tickOnce();
  }, tickMs) as unknown as number;
}

export async function ensureTicking(state?: TimerState) {
  const s = state ?? getState();

  if (!s.endsAt) {
    stop();
    return;
  }

  // run immediately so badge updates instantly
  await tickOnce();

  // schedule based on current remaining
  const ms = Math.max(0, s.endsAt - Date.now());
  const tickMs = desiredTickMs(ms);
  startOrReschedule(tickMs);
}
