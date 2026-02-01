type Driver = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<void>;
  remove: (key: string) => Promise<void>;
};

type StorageArea = {
  get: (key: string) => Promise<Record<string, unknown>>;
  set: (items: Record<string, unknown>) => Promise<void>;
  remove: (key: string) => Promise<void>;
};

function getExtensionStorageLocal(): StorageArea | null {
  const g: any = globalThis as any;

  // Firefox
  if (g?.browser?.storage?.local) {
    return g.browser.storage.local;
  }

  // Chrome (callback → Promise)
  if (g?.chrome?.storage?.local) {
    const c = g.chrome.storage.local;

    return {
      get: (key) =>
        new Promise((resolve, reject) => {
          c.get(key, (res: any) => {
            const err = g?.chrome?.runtime?.lastError;
            err ? reject(new Error(err.message)) : resolve(res ?? {});
          });
        }),
      set: (items) =>
        new Promise((resolve, reject) => {
          c.set(items, () => {
            const err = g?.chrome?.runtime?.lastError;
            err ? reject(new Error(err.message)) : resolve();
          });
        }),
      remove: (key) =>
        new Promise((resolve, reject) => {
          c.remove(key, () => {
            const err = g?.chrome?.runtime?.lastError;
            err ? reject(new Error(err.message)) : resolve();
          });
        }),
    };
  }

  return null;
}

function isExtensionEnv(): boolean {
  return getExtensionStorageLocal() != null;
}

const extensionDriver: Driver = {
  async get(key) {
    const storage = getExtensionStorageLocal();
    if (!storage) return null;

    const res = await storage.get(key);
    const v = (res as any)?.[key];
    return v == null ? null : String(v);
  },

  async set(key, value) {
    const storage = getExtensionStorageLocal();
    if (!storage) throw new Error("Extension storage not available");
    await storage.set({ [key]: value });
  },

  async remove(key) {
    const storage = getExtensionStorageLocal();
    if (!storage) return;
    await storage.remove(key);
  },
};

const webDriver: Driver = {
  async get(key) {
    return globalThis.localStorage?.getItem(key) ?? null;
  },
  async set(key, value) {
    globalThis.localStorage?.setItem(key, value);
  },
  async remove(key) {
    globalThis.localStorage?.removeItem(key);
  },
};

function driver(): Driver {
  return isExtensionEnv() ? extensionDriver : webDriver;
}

export async function get(key: string): Promise<string | null> {
  return driver().get(key);
}

export async function set(key: string, value: string): Promise<void> {
  return driver().set(key, value);
}

export async function remove(key: string): Promise<void> {
  return driver().remove(key);
}

export async function getJSON<T>(key: string): Promise<T | null> {
  const raw = await get(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setJSON(key: string, value: unknown): Promise<void> {
  return set(key, JSON.stringify(value));
}
