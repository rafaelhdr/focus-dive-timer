import { TimerMode } from "../types";
import { useTimerStore } from "../store/timerStore";
import { pushTimerToServer } from "../realtime/sync";

export async function startTimer() {
  useTimerStore.getState().start();

  const { endsAt, remainingTime, mode, isRunning } = useTimerStore.getState();
  await pushTimerToServer({ endsAt, remainingTime, mode, isRunning });
}

export async function pauseTimer() {
  useTimerStore.getState().pause();

  const { endsAt, remainingTime, mode, isRunning } = useTimerStore.getState();
  await pushTimerToServer({ endsAt, remainingTime, mode, isRunning });
}

export async function resetTimer() {
  useTimerStore.getState().reset();

  const { endsAt, remainingTime, mode, isRunning } = useTimerStore.getState();
  await pushTimerToServer({ endsAt, remainingTime, mode, isRunning });
}

export async function addFocusMinutes(minutes: number) {
  useTimerStore.getState().addFocusMinutes(minutes);

  const { endsAt, remainingTime, mode, isRunning } = useTimerStore.getState();
  await pushTimerToServer({ endsAt, remainingTime, mode, isRunning });
}

export async function setTimerMode(mode: TimerMode) {
  useTimerStore.getState().setMode(mode);

  const { endsAt, remainingTime, isRunning } = useTimerStore.getState();
  await pushTimerToServer({ endsAt, remainingTime, mode, isRunning });
}
