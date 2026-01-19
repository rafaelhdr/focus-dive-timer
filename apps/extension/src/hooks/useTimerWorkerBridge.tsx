import { useEffect } from "react";
import browser from "webextension-polyfill";
import { useTimerStore } from "@focusdive/timer";

export function useTimerWorkerBridge() {
  const mode = useTimerStore((s) => s.mode);
  const endsAt = useTimerStore((s) => s.endsAt);
  const isRunning = useTimerStore((s) => s.isRunning);

  useEffect(() => {
    browser.runtime.sendMessage({
      type: "TIMER/SET_ENDS_AT",
      endsAt: isRunning ? endsAt : null,
      mode: mode,
    });
  }, [endsAt, isRunning]);
}
