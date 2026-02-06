export type BrowserKind = "chrome" | "firefox";

export function getBrowserKind(): BrowserKind {
  const hasBrowser = typeof (globalThis as any).browser !== "undefined";
  const hasChrome = typeof (globalThis as any).chrome !== "undefined";

  if (hasBrowser) return "firefox";
  if (hasChrome) return "chrome";

  throw new Error("Not running inside a browser extension context.");
}
