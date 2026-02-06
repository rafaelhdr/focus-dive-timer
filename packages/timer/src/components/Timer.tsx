import { Timer as UITimer } from "@focusdive/ui";
import { addFocusMinutes, useTimerDisplay } from "@focusdive/timer";

const FIVE_MIN_MS = 5 * 60 * 1000;

function isLessThanFiveMinutes(formattedTime: string | null) {
  if (!formattedTime) return false;

  const [mm, ss] = formattedTime.split(":").map(Number);
  if (Number.isNaN(mm) || Number.isNaN(ss)) return false;

  return mm * 60 * 1000 + ss * 1000 < FIVE_MIN_MS;
}

export function Timer() {
  const { formattedTime, mode, isRunning } = useTimerDisplay();

  const showAddFocusMinutesButton =
    mode === "break" || isLessThanFiveMinutes(formattedTime);

  return (
    <UITimer
      time={formattedTime}
      mode={mode}
      isActive={isRunning}
      onAddFocusMinutes={addFocusMinutes}
      showAddFocusMinutesButton={showAddFocusMinutesButton}
    />
  );
}
