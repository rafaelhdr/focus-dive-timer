function getBrowser(): any {
  return (globalThis as any).browser;
}

export function firefoxAction() {
  const b = getBrowser();
  return b?.action ?? b?.browserAction ?? null;
}

export function firefoxRuntime() {
  const b = getBrowser();
  if (!b?.runtime) {
    throw new Error("Firefox runtime API not available");
  }
  return b.runtime;
}
