import { clearBadge, setBadge } from "../../libs/badge";
import type { TimerState } from "../state";
import { formatBadgeText, msLeft } from "./format";

export async function updateBadgeFromState(state: TimerState) {
  if (!state.endsAt) {
    await clearBadge();
    return { done: true, ms: 0 };
  }

  const ms = msLeft(state.endsAt);
  const text = formatBadgeText(ms);

  if (!text) {
    await clearBadge();
    return { done: true, ms };
  }

  await setBadge(text, state.mode);
  return { done: false, ms };
}
