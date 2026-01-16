import { Dashboard } from "./Dashboard";
import { useTimerElapsedDetector, useTimerRealtime } from "@focusdive/timer";
import { useOnTimerFinished } from "@/hooks/useOnTimerFinished";
import { useTimerFinishedAlarm } from "@/hooks/useTimerFinishedAlarm";
import { useSettingsTimerBridge } from "@/hooks/useSettingsTimerBridge";

function TimerEffects() {
  useTimerRealtime();
  useTimerElapsedDetector();
  useOnTimerFinished();
  useSettingsTimerBridge();
  useTimerFinishedAlarm();
  return null;
}

export const LoggedScreen = () => {
  return (
    <>
      <TimerEffects />
      <Dashboard />
    </>
  );
}
