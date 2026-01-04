import { useTimerStore } from "../store/timerStore";
import { pushTimerToServer } from "../realtime/sync";

export async function startTimer() {
  useTimerStore.getState().start();

  const { endsAt, remainingTime, mode, isRunning } = useTimerStore.getState();
  await pushTimerToServer({ endsAt, remainingTime, mode, isRunning });
}

export async function resetTimer() {
  useTimerStore.getState().reset();

  const { endsAt, remainingTime, mode, isRunning } = useTimerStore.getState();
  await pushTimerToServer({ endsAt, remainingTime, mode, isRunning });
}
