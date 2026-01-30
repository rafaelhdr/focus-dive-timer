import { useEffect } from "react";
import { useTimerDisplay } from "@focusdive/timer";

export function useDocumentTitleTimer() {
  const { formattedTime, mode, isRunning } = useTimerDisplay();

  useEffect(() => {
    if (isRunning) {
      const text = mode === "focus" ? "Focus Time" : "Break Time";
      document.title = `${formattedTime} - ${text}`;
    } else {
      document.title = 'Focus Dive';
    }
    return () => {
      document.title = 'Focus Dive';
    };
  }, [formattedTime, mode, isRunning]);
}

