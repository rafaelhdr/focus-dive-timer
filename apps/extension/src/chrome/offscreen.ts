import { onMessage } from "../browser";
import type { PlayAlarmMessage } from "../types";
import { playAlarm, type AlarmSoundId } from "@focusdive/alarm";

function isPlayAlarmMessage(message: unknown): message is PlayAlarmMessage {
  if (!message || typeof message !== "object") return false;

  const m = message as Record<string, unknown>;
  return m.type === "TIMER/PLAY_ALARM";
}

onMessage(async (message: unknown) => {
  if (!isPlayAlarmMessage(message)) return;

  playAlarm(message.soundId as AlarmSoundId, { volume: message.volume });
});
