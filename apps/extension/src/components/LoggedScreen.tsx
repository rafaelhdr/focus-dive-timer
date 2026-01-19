import { Dashboard } from "./Dashboard";
import { useTimerElapsedDetector, useTimerRealtime } from "@focusdive/timer";
import { useOnTimerFinished } from "@/hooks/useOnTimerFinished";
import { useTimerFinishedAlarm } from "@/hooks/useTimerFinishedAlarm";
import { useSettingsTimerBridge } from "@/hooks/useSettingsTimerBridge";
import { useTimerWorkerBridge } from "@/hooks/useTimerWorkerBridge";

function TimerEffects() {
  useTimerRealtime();
  useTimerElapsedDetector();
  useOnTimerFinished();
  useSettingsTimerBridge();
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
