import { fdFetch } from "@focusdive/api-client";
import { TimerData } from "../types";
import { fromTimerApi, toTimerApiPatch } from "../mappers";

export async function updateTimer(
  payload: TimerData,
): Promise<TimerData> {
  const { data, error } = await fdFetch.PUT("/v1/timer", {
    body: toTimerApiPatch(payload),
  });

  if (error || !data) {
    throw new Error("Failed to update timer");
  }

  return fromTimerApi(data);
}
