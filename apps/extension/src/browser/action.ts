import { getBrowserKind } from "./env";
import { chromeAction, chromePromisifyVoid } from "./chrome";
import { firefoxAction } from "./firefox";

export type BadgeTextDetails = { text: string; tabId?: number };
export type BadgeBackgroundColorDetails = {
  color: string | number[];
  tabId?: number;
};

export async function setBadgeText(details: BadgeTextDetails): Promise<void> {
  if (getBrowserKind() === "firefox") {
    await firefoxAction().setBadgeText(details);
    return;
  }

  const action = chromeAction();
  await chromePromisifyVoid(action.setBadgeText, action, [details]);
}

export async function setBadgeBackgroundColor(
  details: BadgeBackgroundColorDetails
): Promise<void> {
  if (getBrowserKind() === "firefox") {
    await firefoxAction().setBadgeBackgroundColor(details);
    return;
  }

  const action = chromeAction();
  await chromePromisifyVoid(action.setBadgeBackgroundColor, action, [details]);
}
