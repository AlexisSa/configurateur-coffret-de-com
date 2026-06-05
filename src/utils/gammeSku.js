/**
 * Code lettre dans la référence XHG3 (ex. M 250 → M, P 300 → T).
 * @param {string} label
 * @returns {string}
 */
export function getGammeLetterCode(label) {
  const normalized = label.trim();
  if (/^Plaque EASY P\b/.test(normalized) || /^P\b/.test(normalized)) return "T";
  return normalized.split(/\s+/)[0];
}

/**
 * Référence châssis : XHG3 + code gamme, sans suffixe variante (avant le « - »).
 * @param {import('./catalog.js').ReturnType<typeof import('./catalog.js').getGammeById>} gamme
 * @param {{ skuSuffix?: string } | null | undefined} [materiau]
 * @returns {string}
 */
export function buildGammeSku(gamme, materiau) {
  if (!gamme) return "";
  const suffix = materiau?.skuSuffix ?? "";
  if (gamme.baseSku) return gamme.baseSku + suffix;
  return `XHG3${getGammeLetterCode(gamme.label)}${suffix}`;
}
