import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@focusdive/auth";
import { fetchSettings, updateSettings } from "../services/settings";
import { Preferences } from "../types";
import { getJSON, setJSON } from "@focusdive/storage";

export const settingsQueryKey = ["settings"] as const;

const PREFERENCES_STORAGE_KEY = "focusdive:preferences";

export const DEFAULT_PREFERENCES: Preferences = {
  alarmSound: "minimalistic",
  autostartBreak: true,
  autostartFocus: true,
  defaultBreakDuration: 5,
  defaultFocusDuration: 25,
  focusBeepEnabled: true,
  focusBeepVolume: 1,
};

async function fetchPreferencesLocal(): Promise<Preferences> {
  const stored = await getJSON<Partial<Preferences>>(
    PREFERENCES_STORAGE_KEY
  );

  return {
    ...DEFAULT_PREFERENCES,
    ...stored,
  };
}

async function updatePreferencesLocal(patch: Partial<Preferences>): Promise<Preferences> {
  const current = await fetchPreferencesLocal();
  const next = { ...current, ...patch } as Preferences;
  await setJSON(PREFERENCES_STORAGE_KEY, next);
  return next;
}

export function usePreferences() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: [settingsQueryKey, isAuthenticated],
    queryFn: isAuthenticated ? fetchSettings : fetchPreferencesLocal,
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
}

export function useUpdatePreferences() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (patch: Partial<Preferences>) =>
      isAuthenticated ? updateSettings(patch) : updatePreferencesLocal(patch),

    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: settingsQueryKey });

      const prev = qc.getQueryData<Preferences>(settingsQueryKey);

      qc.setQueryData<Preferences>(settingsQueryKey, (old) => {
        const base = old ?? ({} as Preferences);
        return { ...base, ...patch } as Preferences;
      });

      return { prev };
    },

    onError: (_err, _patch, ctx) => {
      if (ctx?.prev) qc.setQueryData(settingsQueryKey, ctx.prev);
      else qc.removeQueries({ queryKey: settingsQueryKey });
    },

    onSuccess: (data) => {
      qc.setQueryData(settingsQueryKey, data);
    },
  });
}
