import { Dashboard } from "./Dashboard";
import { useTimerElapsedDetector, useTimerRealtime } from "@focusdive/timer";
import { useOnTimerFinished } from "@/hooks/useOnTimerFinished";
import { useTimerFinishedAlarm } from "@/hooks/useTimerFinishedAlarm";
import { usePreferencesTimerBridge } from "@/hooks/usePreferencesTimerBridge";
import { useTimerWorkerBridge } from "@/hooks/useTimerWorkerBridge";

function TimerEffects() {
  useTimerRealtime();
  useTimerElapsedDetector();
  useOnTimerFinished();
  usePreferencesTimerBridge();
  useTimerFinishedAlarm();
  useTimerWorkerBridge();
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
