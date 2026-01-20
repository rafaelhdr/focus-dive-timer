export function msLeft(endsAt: number | null) {
  return endsAt ? Math.max(0, endsAt - Date.now()) : 0;
}

export function formatBadgeText(ms: number): string | null {
  const totalSeconds = Math.ceil(ms / 1000);

  if (totalSeconds <= 0) return null;

  // >= 60s → minutes
  if (totalSeconds >= 60) return String(Math.ceil(totalSeconds / 60) - 1);

  // < 60s → seconds
  return String(totalSeconds - 1);
}

export function desiredTickMs(ms: number) {
  // >= 60s → every 10s; < 60s → every 1s
  return ms <= 60_000 ? 1_000 : 10_000;
}
