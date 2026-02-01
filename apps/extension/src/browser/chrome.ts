function getChrome(): any {
  return (globalThis as any).chrome;
}

function lastErrorMessage(): string | null {
  const c = getChrome();
  return c?.runtime?.lastError?.message ?? null;
}

export function chromeAction() {
  const c = getChrome();
  return c?.action ?? c?.browserAction ?? null;
}

export function chromePromisifyVoid(fn: Function, ctx: any, args: any[]): Promise<void> {
  return new Promise((resolve, reject) => {
    fn.call(ctx, ...args, () => {
      const msg = lastErrorMessage();
      msg ? reject(new Error(msg)) : resolve();
    });
  });
}

export function chromePromisify<T>(fn: Function, ctx: any, args: any[]): Promise<T> {
  return new Promise((resolve, reject) => {
    fn.call(ctx, ...args, (result: T) => {
      const msg = lastErrorMessage();
      msg ? reject(new Error(msg)) : resolve(result);
    });
  });
}
