import browser from "webextension-polyfill";
import type { TimerMode } from "@focusdive/timer";

export type TimerState = {
  endsAt: number | null;
  mode: TimerMode;
  isRunning: boolean;
  remainingTime: number | null;
  focusBeepEnabled: boolean;
  focusBeepVolume: number;
  alarmSound: string;
  autostartFocus: boolean;
  autostartBreak: boolean;
  defaultFocusDuration: number;
  defaultBreakDuration: number;
  lastFinishedEndsAt: number | null;
};

const STORAGE_KEY = "timer_state_v1";

const INITIAL_STATE: TimerState = {
  endsAt: null,
  mode: "focus",
  isRunning: false,
  remainingTime: null,
  focusBeepEnabled: false,
  focusBeepVolume: 50,
  alarmSound: "default",
  autostartFocus: false,
  autostartBreak: false,
  defaultFocusDuration: 25,
  defaultBreakDuration: 5,
  lastFinishedEndsAt: null,
}

let state: TimerState = INITIAL_STATE;

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
  state = INITIAL_STATE;
  await browser.storage.local.remove(STORAGE_KEY);
}
