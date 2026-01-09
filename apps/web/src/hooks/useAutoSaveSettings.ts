import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useSettingsQuery, useUpdateSettingsMutation, type Settings } from "@focusdive/settings";

function toDraft(s: Settings) {
  return {
    focusBeepEnabled: s.focusBeepEnabled,
    focusBeepVolume: s.focusBeepVolume,
    alarmSound: s.alarmSound,
    autostartBreak: !!s.autostartBreak,
    autostartFocus: !!s.autostartFocus,
    defaultFocusDuration: s.defaultFocusDuration ?? 25,
    defaultBreakDuration: s.defaultBreakDuration ?? 5,
  };
}

export function useAutoSaveSettings() {
  const { data: settings } = useSettingsQuery();
  const update = useUpdateSettingsMutation();

  const [draft, setDraft] = useState<ReturnType<typeof toDraft> | null>(null);
  const lastSavedRef = useRef<string>("");
  const skipNextRef = useRef(true);

  function patchDraft(patch: Partial<Settings>) {
    setDraft((d) => (d ? { ...d, ...patch } : d));
  }

  useEffect(() => {
    if (!settings) return;
    setDraft(toDraft(settings));
    lastSavedRef.current = JSON.stringify(toDraft(settings));
    skipNextRef.current = true;
  }, [settings]);

  useEffect(() => {
    if (!draft) return;

    const serialized = JSON.stringify(draft);
    if (skipNextRef.current) {
      skipNextRef.current = false;
      return;
    }
    if (serialized === lastSavedRef.current) return;

    const id = window.setTimeout(async () => {
      try {
        await update.mutateAsync(draft);
        lastSavedRef.current = serialized;
        toast.success("Settings saved");
      } catch {
        toast.error("Failed to save settings");
      }
    }, 600);

    return () => window.clearTimeout(id);
  }, [draft, update]);

  return {
    draft,
    setDraft,
    patchDraft,
    isSaving: update.isPending,
    saveError: update.error,
  };
}
