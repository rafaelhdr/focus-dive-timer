import type { TimerMode } from "@focusdive/timer";

import { getState } from "./state";
import { startCountdown, stopCountdown } from "./service_worker";

export function syncBackgroundFromState(): void {
  const s = getState();

  const endsAt = s.endsAt ?? null;
  const mode: TimerMode = s.mode ?? "focus";

  if (endsAt) startCountdown(endsAt, mode);
  else stopCountdown();
}
