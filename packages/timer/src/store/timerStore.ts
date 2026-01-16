import { isDebug } from "@focusdive/config";
import { create } from "zustand";
import { timerEvents } from "../events/timerEvents";

export type TimerMode = "focus" | "break";

const getResetTime = (mode: TimerMode, focusDuration: number, breakDuration: number) => {
  const ms = mode === "focus" ? focusDuration : breakDuration;
  if (isDebug) {
    return ms / 60;
  }
  return ms;
}

export interface TimerState {
  mode: TimerMode;

  focusDuration: number;
  setFocusDuration: (minutes: number) => void;
  autostartFocus: boolean;
  breakDuration: number;
  setBreakDuration: (minutes: number) => void;
  autostartBreak: boolean;
  applyConfig: (config: { focusMinutes: number; breakMinutes: number; autostartFocus: boolean; autostartBreak: boolean }) => void;

  endsAt: number | null; // timestamp in ms when the timer will end when running
  remainingTime: number; // remaining time in ms when paused

  isRunning: boolean;
  finishedAt: number | null; // avoid race conditions on finish

  start: () => void;
  pause: () => void;
  reset: () => void;
  setMode: (mode: TimerMode) => void;
  finish: ({expectedMode}: {expectedMode: TimerMode}) => void;

  setFromServer: (data: Partial<Pick<TimerState, "mode" | "endsAt" | "remainingTime" | "isRunning">>) => void;
}

const FOCUS_MS = 25 * 60 * 1000;
const BREAK_MS = 5 * 60 * 1000;

export const useTimerStore = create<TimerState>((set, get) => ({
  mode: "focus",
  focusDuration: FOCUS_MS,
  setFocusDuration: (minutes: number) => {
    set({ focusDuration: minutes * 60 * 1000 });
    if (!get().isRunning) {
      get().reset();
    }
  },
  autostartFocus: true,
  breakDuration: BREAK_MS,
  setBreakDuration: (minutes: number) => {
    set({ breakDuration: minutes * 60 * 1000 });
    if (!get().isRunning) {
      get().reset();
    }
  },
  autostartBreak: true,
  applyConfig: ({ focusMinutes, breakMinutes, autostartFocus, autostartBreak }) => {
    set({
      focusDuration: focusMinutes * 60 * 1000,
      breakDuration: breakMinutes * 60 * 1000,
      autostartFocus,
      autostartBreak,
    });
    if (!get().isRunning) {
      get().reset();
    }
  },

  endsAt: null,
  remainingTime: FOCUS_MS,
  isRunning: false,
  finishedAt: null,

  start: () => {
    const mode = get().mode;
    const { remainingTime, focusDuration, breakDuration } = get();
    const defaultMs = mode === "focus" ? focusDuration : breakDuration;

    const ms = remainingTime > 0 ? remainingTime : defaultMs;

    set({
      mode,
      isRunning: true,
      endsAt: Date.now() + ms + 1000,
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
    const ms = getResetTime(mode, focusDuration, breakDuration);

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

  finish: ({ expectedMode }) => {
    const s = get();
    const mode = s.mode;

    if (mode !== expectedMode) return;
    if (!s.isRunning || !s.endsAt) return;
    if (s.finishedAt && s.finishedAt >= s.endsAt) return;

    set({
      isRunning: false,
      endsAt: null,
      remainingTime: 0,
      finishedAt: Date.now(),
    });

    timerEvents.emit("timer_finished", { mode: s.mode });
  },
}));
