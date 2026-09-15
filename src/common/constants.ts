// Фиксированный список пресетов аватаров. Ассеты пакуются в клиент,
// сервер только валидирует, что переданный ключ входит в этот список.
export const AVATAR_PRESETS = [
  'avatar_01',
  'avatar_02',
  'avatar_03',
  'avatar_04',
  'avatar_05',
  'avatar_06',
  'avatar_07',
  'avatar_08',
] as const;

export type AvatarKey = (typeof AVATAR_PRESETS)[number];

export const DEFAULT_AVATAR_KEY: AvatarKey = 'avatar_01';

export const POINTS_PER_CORRECT_ANSWER = 100;
