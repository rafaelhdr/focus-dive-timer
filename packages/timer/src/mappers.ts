import { TimerData, TimerDataApi } from "./types";

export function fromTimerApi(data: TimerDataApi): TimerData {
  return {
    mode: data.mode,
    endsAt: data.ends_at,
    remainingTime: data.remaining_time,
    isRunning: data.is_running,
  };
}

export function toTimerApiPatch(patch: TimerData): TimerDataApi {
  return {
    mode: patch.mode,
    ends_at: patch.endsAt,
    remaining_time: patch.remainingTime,
    is_running: patch.isRunning,
  };
}
