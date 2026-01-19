import { type TimerMode } from "@focusdive/timer";
import browser from "webextension-polyfill";

const actionApi = browser.action ?? browser.browserAction;

type BadgeColor = [number, number, number, number];

const BADGE_COLORS: Record<TimerMode, BadgeColor> = {
  focus: [26, 175, 230, 204],
  break: [5, 150, 105, 204],
};

export async function setBadge(text: string, mode: TimerMode = "focus") {
  const color = BADGE_COLORS[mode];
  await actionApi.setBadgeBackgroundColor({ color });
  await actionApi.setBadgeText({ text });
}

export async function clearBadge() {
  await actionApi.setBadgeText({ text: "" });
}
