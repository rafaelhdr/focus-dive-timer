import browser from "webextension-polyfill";
import type { TimerSetEndsAtMessage } from "../types";
import { restoreState, setState } from "./state";
import { ensureTicking } from "./ticker";
import { updateBadgeFromState } from "./badge";

async function init() {
  const state = await restoreState();
  await updateBadgeFromState(state);
  await ensureTicking(state);
}

browser.runtime.onMessage.addListener(async (message: unknown) => {
  const msg = message as Partial<TimerSetEndsAtMessage>;
  if (msg?.type !== "TIMER/SET_ENDS_AT") return;

  await setState({
    endsAt: msg.endsAt ?? null,
    mode: msg.mode ?? "focus",
  });

  await ensureTicking();
});

// boot
void init();
