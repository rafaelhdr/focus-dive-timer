import { useEffect } from "react";
import browser from "webextension-polyfill";
import { useTimerStore } from "@focusdive/timer";

export function useTimerWorkerBridge() {
  const mode = useTimerStore((s) => s.mode);
  const endsAt = useTimerStore((s) => s.endsAt);
  const isRunning = useTimerStore((s) => s.isRunning);
  const remainingTime = useTimerStore((s) => s.remainingTime);

  useEffect(() => {
    browser.runtime.sendMessage({
      type: "TIMER/SYNC_BACKGROUND",
      endsAt,
      mode,
      isRunning,
      remainingTime,
    });
  }, [endsAt, mode, isRunning, remainingTime]);
}
