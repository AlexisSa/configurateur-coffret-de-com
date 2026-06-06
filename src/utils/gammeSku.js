import { getOptionById } from "./catalog.js";

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
 * Suffixe châssis issu des options (ex. brassage extérieur → « -E »).
 * @param {Record<string, string>} [options]
 * @returns {string}
 */
export function getChassisSkuSuffixFromOptions(options = {}) {
  const optionId = options.brassage;
  if (!optionId) return "";
  const option = getOptionById(optionId);
  return option?.rules?.chassisSkuSuffix ?? "";
}

/**
 * Référence châssis : XHG3 + code gamme, sans suffixe variante (avant le « - »).
 * @param {import('./catalog.js').ReturnType<typeof import('./catalog.js').getGammeById>} gamme
 * @param {{ skuSuffix?: string } | null | undefined} [materiau]
 * @param {Record<string, string>} [options]
 * @returns {string}
 */
export function buildGammeSku(gamme, materiau, options = {}) {
  if (!gamme) return "";
  const suffix = materiau?.skuSuffix ?? "";
  const chassisSuffix = getChassisSkuSuffixFromOptions(options);
  if (gamme.baseSku) return gamme.baseSku + suffix + chassisSuffix;
  return `XHG3${getGammeLetterCode(gamme.label)}${suffix}${chassisSuffix}`;
}
