import { create } from "zustand";

const hasTokens = () =>
  !!localStorage.getItem("focus_dive_access_token") &&
  !!localStorage.getItem("focus_dive_refresh_token");

type AuthStore = {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: hasTokens(),
  setAuthenticated: (value) => set({ isAuthenticated: value }),
}));
