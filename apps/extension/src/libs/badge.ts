import browser from "webextension-polyfill";

const actionApi = browser.action ?? browser.browserAction;

type Mode = "focus" | "break";
type BadgeColor = [number, number, number, number];

const BADGE_COLORS: Record<Mode, BadgeColor> = {
  focus: [26, 175, 230, 204],
  break: [5, 150, 105, 204],
};

export async function setBadge(text: string, mode: Mode = "focus") {
  const color = BADGE_COLORS[mode];
  await actionApi.setBadgeBackgroundColor({ color });
  await actionApi.setBadgeText({ text });
}

export async function clearBadge() {
  await actionApi.setBadgeText({ text: "" });
}
