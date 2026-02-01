import { getAlarmSound, type AlarmSoundId } from "./sounds";

export type AlarmPlayOptions = {
  volume?: number;
};

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

const cache = new Map<string, HTMLAudioElement>();

function getOrCreate(src: string): HTMLAudioElement | null {
  if (typeof Audio === "undefined") return null;

  const cached = cache.get(src);
  if (cached) return cached;

  const el = new Audio(src);
  el.preload = "auto";
  (el as any).playsInline = true;
  cache.set(src, el);
  return el;
}

export async function play(
  id: AlarmSoundId,
  opts: AlarmPlayOptions = {}
): Promise<boolean> {
  const { src } = getAlarmSound(id);
  const el = getOrCreate(src);
  if (!el) return false;

  el.volume = clamp01(opts.volume ?? 1);
  el.currentTime = 0;
  await el.play();
  return true;
}
