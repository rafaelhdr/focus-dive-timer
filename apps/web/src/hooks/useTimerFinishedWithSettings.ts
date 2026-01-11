import { useTimerFinished } from "@focusdive/timer";
import { useSettingsQuery } from "@focusdive/settings";

export function useTimerFinishedWithSettings() {
  const { data: settings } = useSettingsQuery();

  const autostartBreak = settings?.autostartBreak ?? false;
  const autostartFocus = settings?.autostartFocus ?? false;

  useTimerFinished({ autostartBreak, autostartFocus });
}
