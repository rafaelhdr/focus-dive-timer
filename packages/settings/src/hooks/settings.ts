import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSettings, updateSettings } from "../services/settings";
import { Settings } from "../types";

export const settingsQueryKey = ["settings"] as const;

export function useSettingsQuery() {
  return useQuery({
    queryKey: settingsQueryKey,
    queryFn: fetchSettings,
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateSettingsMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: updateSettings,

    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: settingsQueryKey });

      const prev = qc.getQueryData<Settings>(settingsQueryKey);

      qc.setQueryData<Settings>(settingsQueryKey, (old) => {
        if (!old) return patch as Settings;
        return { ...old, ...patch };
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
