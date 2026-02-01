import { getBrowserKind } from "./env";
import { chromePromisify } from "./chrome";

export type RuntimeMessageHandler = (
  message: unknown,
  sender: unknown
) => unknown | Promise<unknown>;

function firefoxRuntime() {
  const b = (globalThis as any).browser;
  if (!b?.runtime) throw new Error("browser.runtime not available");
  return b.runtime;
}

function chromeRuntime() {
  const c = (globalThis as any).chrome;
  if (!c?.runtime) throw new Error("chrome.runtime not available");
  return c.runtime;
}

export function onMessage(handler: RuntimeMessageHandler): () => void {
  if (getBrowserKind() === "firefox") {
    const rt = firefoxRuntime();
    const listener = (message: unknown, sender: unknown) => handler(message, sender);
    rt.onMessage.addListener(listener);
    return () => rt.onMessage.removeListener(listener);
  }

  const rt = chromeRuntime();

  // Chrome needs sendResponse + return true for async handlers
  const listener = (
    message: unknown,
    sender: unknown,
    sendResponse: (resp: unknown) => void
  ) => {
    Promise.resolve(handler(message, sender))
      .then((resp) => sendResponse(resp))
      .catch((err) =>
        sendResponse({ __error: true, message: err instanceof Error ? err.message : String(err) })
      );
    return true;
  };

  rt.onMessage.addListener(listener);
  return () => rt.onMessage.removeListener(listener);
}

export async function sendMessage<T = unknown>(message: unknown): Promise<T> {
  if (getBrowserKind() === "firefox") {
    return firefoxRuntime().sendMessage(message);
  }

  const rt = chromeRuntime();
  return chromePromisify<T>(rt.sendMessage, rt, [message]);
}
