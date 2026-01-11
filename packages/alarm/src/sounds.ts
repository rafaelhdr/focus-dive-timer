export type AlarmSoundId =
  | "level"
  | "minimalistic"
  | "snappy"
  | "wooden";

export type AlarmSound = {
  id: AlarmSoundId;
  name: string;
  src: string;
};

const src = (file: string) =>
  new URL(`./sounds/${file}`, import.meta.url).href;

export const ALARM_SOUNDS: AlarmSound[] = [
  { id: "level",        name: "Level",        src: src("level.mp3") },
  { id: "minimalistic", name: "Minimalistic", src: src("minimalistic.mp3") },
  { id: "snappy",       name: "Snappy",       src: src("snappy.mp3") },
  { id: "wooden",       name: "Wooden",       src: src("wooden.mp3") },
];

const SOUND_MAP: Record<AlarmSoundId, AlarmSound> =
  Object.fromEntries(ALARM_SOUNDS.map(s => [s.id, s])) as any;

export function getAlarmSound(id: AlarmSoundId): AlarmSound {
  return SOUND_MAP[id] ?? ALARM_SOUNDS[0]!;
}
