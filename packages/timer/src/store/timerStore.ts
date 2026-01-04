import { create } from "zustand";

export type TimerMode = "focus" | "break";

export interface TimerState {
  mode: TimerMode;

  focusDuration: number;
  breakDuration: number;

  endsAt: number | null; // timestamp in ms when the timer will end when running
  remainingTime: number; // remaining time in ms when paused

  isRunning: boolean;

  start: () => void;
  pause: () => void;
  reset: () => void;
  setMode: (mode: TimerMode) => void;

  setFromServer: (data: Partial<Pick<TimerState, "mode" | "endsAt" | "remainingTime" | "isRunning">>) => void;
}

const FOCUS_MS = 25 * 60 * 1000;
const BREAK_MS = 5 * 60 * 1000;

export const useTimerStore = create<TimerState>((set, get) => ({
  mode: "focus",
  focusDuration: FOCUS_MS,
  breakDuration: BREAK_MS,

  endsAt: null,
  remainingTime: FOCUS_MS,
  isRunning: false,

  start: () => {
    const mode = get().mode;
    const { remainingTime, focusDuration, breakDuration } = get();
    const defaultMs = mode === "focus" ? focusDuration : breakDuration;

    const ms = remainingTime > 0 ? remainingTime : defaultMs;

    set({
      mode,
      isRunning: true,
      endsAt: Date.now() + ms,
      remainingTime: 0,
    });
  },

  pause: () => {
    const { endsAt, isRunning } = get();
    if (!isRunning || !endsAt) return;

    const remaining = Math.max(0, endsAt - Date.now());

    set({
      isRunning: false,
      endsAt: null,
      remainingTime: remaining,
    });
  },

  reset: () => {
    const { mode, focusDuration, breakDuration } = get();
    const ms = mode === "focus" ? focusDuration : breakDuration;

    set({
      mode,
      isRunning: false,
      endsAt: null,
      remainingTime: ms,
    });
  },

  setMode: (mode) => {
    set({ mode });
    get().reset();
  },

  setFromServer: (data) => set(data),
}));
