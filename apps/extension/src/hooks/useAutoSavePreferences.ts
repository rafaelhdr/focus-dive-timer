import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { usePreferences, useUpdatePreferences, type Preferences } from "@focusdive/preferences";

function toDraft(s: Preferences) {
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

export function useAutoSavePreferences() {
  const { data: preferences } = usePreferences();
  const update = useUpdatePreferences();

  const [draft, setDraft] = useState<ReturnType<typeof toDraft> | null>(null);
  const lastSavedRef = useRef<string>("");
  const skipNextRef = useRef(true);

  function patchDraft(patch: Partial<Preferences>) {
    setDraft((d) => (d ? { ...d, ...patch } : d));
  }

  useEffect(() => {
    if (!preferences) return;
    setDraft(toDraft(preferences));
    lastSavedRef.current = JSON.stringify(toDraft(preferences));
    skipNextRef.current = true;
  }, [preferences]);

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
        toast.success("Preferences saved");
      } catch {
        toast.error("Failed to save preferences");
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
