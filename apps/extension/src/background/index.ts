import type { TimerSyncMessage } from "../types";
import { syncBackgroundFromState } from "./timer";
import { applyTimerSync } from "./commands";
import { registerTimerFinishedListener } from "./listeners/timerFinished";
import { onMessage } from "../browser";

function isTimerSyncMessage(message: unknown): message is TimerSyncMessage {
  if (!message || typeof message !== "object") return false;

  const m = message as Record<string, unknown>;
  return m.type === "TIMER/SYNC_BACKGROUND";
}

onMessage(async (message: unknown) => {
  if (!isTimerSyncMessage(message)) return;

  await applyTimerSync(message);
  syncBackgroundFromState();
});

registerTimerFinishedListener();
