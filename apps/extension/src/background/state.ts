import browser from "webextension-polyfill";
import type { TimerMode } from "@focusdive/timer";

export type TimerState = {
  endsAt: number | null;
  mode: TimerMode;
  remainingTime: number | null;
};

const STORAGE_KEY = "timer_state_v1";

let state: TimerState = {
  endsAt: null,
  mode: "focus",
  remainingTime: null,
};

export function getState(): TimerState {
  return state;
}

export async function setState(next: Partial<TimerState>) {
  state = { ...state, ...next };
  await browser.storage.local.set({ [STORAGE_KEY]: state });
}

export async function restoreState() {
  const stored = await browser.storage.local.get(STORAGE_KEY);
  if (stored?.[STORAGE_KEY]) {
    state = stored[STORAGE_KEY] as TimerState;
  }
  return state;
}

export async function clearState() {
  state = { endsAt: null, mode: "focus", remainingTime: null };
  await browser.storage.local.remove(STORAGE_KEY);
}
