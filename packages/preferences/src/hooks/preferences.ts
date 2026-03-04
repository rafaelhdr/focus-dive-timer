import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@focusdive/auth";
import { fetchPreferences, updatePreferences } from "../services/preferences";
import { Preferences } from "../types";
import { getJSON, setJSON } from "@focusdive/storage";

const PREFERENCES_STORAGE_KEY = "focusdive:preferences";

const preferencesQueryKey = (isAuth: boolean) => ["preferences", isAuth] as const;

export const DEFAULT_PREFERENCES: Preferences = {
  alarmSound: "minimalistic",
  autostartBreak: true,
  autostartFocus: true,
  defaultBreakDuration: 5,
  defaultFocusDuration: 25,
  focusBeepEnabled: true,
  focusBeepVolume: 100,
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
    queryKey: preferencesQueryKey(isAuthenticated),
    queryFn: isAuthenticated ? fetchPreferences : fetchPreferencesLocal,
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
}

export function useUpdatePreferences() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (patch: Preferences) =>
      isAuthenticated ? updatePreferences(patch) : updatePreferencesLocal(patch),

    onMutate: async (patch) => {
      await qc.invalidateQueries({ queryKey: preferencesQueryKey(isAuthenticated) });

      const prev = qc.getQueryData<Preferences>(preferencesQueryKey(isAuthenticated));

      qc.setQueryData<Preferences>(preferencesQueryKey(isAuthenticated), (old) => {
        const base = old ?? ({} as Preferences);
        return { ...base, ...patch } as Preferences;
      });

      return { prev };
    },

    onError: (_err, _patch, ctx) => {
      if (ctx?.prev) qc.setQueryData(preferencesQueryKey(isAuthenticated), ctx.prev);
      else qc.removeQueries({ queryKey: preferencesQueryKey(isAuthenticated) });
    },

    onSuccess: (data) => {
      qc.setQueryData(preferencesQueryKey(isAuthenticated), data);
    },
  });
}
