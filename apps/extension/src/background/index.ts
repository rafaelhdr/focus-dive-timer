import browser from "webextension-polyfill";

import type { TimerSyncMessage } from "../types";
import { syncBackground, type SyncBackgroundArgs } from "./timer";
import { applyTimerSync } from "./commands";

browser.runtime.onMessage.addListener(async (message: unknown) => {
  const msg = message as Partial<TimerSyncMessage>;
  if (msg?.type !== "TIMER/SYNC_BACKGROUND") return;

  const synced = await syncBackground({ source: "message", message: msg } as SyncBackgroundArgs);
  await applyTimerSync(synced);
});
