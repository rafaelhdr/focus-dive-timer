import type { TimerMode } from "@focusdive/timer";
import { getJSON, setJSON, remove } from "@focusdive/storage";

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
  await setJSON(STORAGE_KEY, state);
}

export async function restoreState() {
  const stored = await getJSON<TimerState>(STORAGE_KEY);
  if (stored) state = stored;
  return state;
}

export async function clearState() {
  state = INITIAL_STATE;
  await remove(STORAGE_KEY);
}
