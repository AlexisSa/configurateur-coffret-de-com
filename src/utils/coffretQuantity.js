export const MIN_COFFRET_COUNT = 1;
export const MAX_COFFRET_COUNT = 1000;
export const DEFAULT_COFFRET_COUNT = 1;

/**
 * @param {unknown} value
 * @returns {number}
 */
export function normalizeCoffretCount(value) {
  const n = Number.parseInt(String(value ?? DEFAULT_COFFRET_COUNT), 10);
  if (!Number.isFinite(n)) return DEFAULT_COFFRET_COUNT;
  return Math.min(MAX_COFFRET_COUNT, Math.max(MIN_COFFRET_COUNT, n));
}
