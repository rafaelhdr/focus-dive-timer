import { create } from "zustand";
import { get } from "@focusdive/storage";

export async function hasTokens(): Promise<boolean> {
  const [access, refresh] = await Promise.all([
    get("focus_dive_access_token"),
    get("focus_dive_refresh_token"),
  ]);

  return !!access && !!refresh;
}

type AuthStore = {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  hydrate: async () => {
    const authenticated = await hasTokens();
    set({ isAuthenticated: authenticated });
  },
}));
