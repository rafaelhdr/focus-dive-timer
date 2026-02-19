import { useTimerFinished } from "@focusdive/timer";
import { usePreferences } from "@focusdive/preferences";

export function useOnTimerFinished() {
  const { data: preferences } = usePreferences();

  const autostartBreak = preferences?.autostartBreak ?? false;
  const autostartFocus = preferences?.autostartFocus ?? false;

  useTimerFinished({ autostartBreak, autostartFocus });
}
