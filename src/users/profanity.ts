// Базовый фильтр нецензурной лексики для MVP — минимальный чёрный список
// с проверкой по вхождению подстроки (без учёта регистра и замены букв).
// Не претендует на полноту, но отсекает самое очевидное.
const BLOCKLIST = ['хуй', 'пизд', 'ебат', 'ебал', 'бляд', 'сука', 'fuck', 'shit', 'bitch'];

export function containsProfanity(text: string): boolean {
  const normalized = text.toLowerCase();
  return BLOCKLIST.some((word) => normalized.includes(word));
}
