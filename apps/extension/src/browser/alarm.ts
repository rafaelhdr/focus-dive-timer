import { getBrowserKind } from "./env";
import { sendMessage } from "./runtime";
import { playAlarm as firefoxPlayAlarm, AlarmSoundId } from "@focusdive/alarm";
import { setupOffscreenDocument } from "../chrome/setupOffscreen";

export const playAlarm = async (soundId: string, options: { volume: number }) => {
  if (getBrowserKind() === "firefox") {
    return firefoxPlayAlarm(soundId as AlarmSoundId, options);
  }

  await setupOffscreenDocument("/offscreen.html")
  await sendMessage({ type: "TIMER/PLAY_ALARM", soundId, volume: options.volume });
}
