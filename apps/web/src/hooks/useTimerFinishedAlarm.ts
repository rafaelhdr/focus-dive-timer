import { useEffect } from "react";
import { playAlarm, type AlarmSoundId } from "@focusdive/alarm";
import { usePreferences } from "@focusdive/preferences";
import { timerEvents } from "@focusdive/timer";

export function useTimerFinishedAlarm() {
  const { data: preferences } = usePreferences();

  useEffect(() => {
    if (!preferences) return;

    const handler = async () => {
      if (!preferences.focusBeepEnabled) return;

      await playAlarm(preferences.alarmSound as AlarmSoundId, {
        volume: preferences.focusBeepVolume,
      });
    };

    timerEvents.on("timer_finished", handler);
    return () => timerEvents.off("timer_finished", handler);
  }, [preferences]);
}
