import { Timer as UITimer } from "@focusdive/ui";
import { useTimerDisplay } from "@focusdive/timer";

export default function Timer() {
  const { formattedTime, mode, isRunning } = useTimerDisplay();

  return (
    <UITimer
      time={formattedTime}
      mode={mode}
      isActive={isRunning}
      onAddFocusMinutes={console.log}
    />
  );
}

