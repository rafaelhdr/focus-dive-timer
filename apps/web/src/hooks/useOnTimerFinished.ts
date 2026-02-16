import { useTimerFinished } from "@focusdive/timer";
import { usePreferences } from "@focusdive/settings";

export function useOnTimerFinished() {
  const { data: settings } = usePreferences();

  const autostartBreak = settings?.autostartBreak ?? false;
  const autostartFocus = settings?.autostartFocus ?? false;

  useTimerFinished({ autostartBreak, autostartFocus });
}
