import { useEffect } from "react";
import { playAlarm, type AlarmSoundId } from "@focusdive/alarm";
import { useSettingsQuery } from "@focusdive/settings";
import { timerEvents } from "@focusdive/timer";

export function useTimerFinishedAlarm() {
  const { data: settings } = useSettingsQuery();

  useEffect(() => {
    if (!settings) return;

    const handler = async () => {
      if (!settings.focusBeepEnabled) return;

      await playAlarm(settings.alarmSound as AlarmSoundId, {
        volume: settings.focusBeepVolume,
      });
    };

    timerEvents.on("timer_finished", handler);
    return () => timerEvents.off("timer_finished", handler);
  }, [settings]);
}

