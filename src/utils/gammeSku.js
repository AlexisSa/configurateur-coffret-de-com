// @ts-check
import { getOptionById } from "./catalog.js";

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
 * SKU de tarification du châssis (matrice prix), distinct de la référence logique.
 * @param {import('./catalog.js').ReturnType<typeof import('./catalog.js').getGammeById>} gamme
 * @param {{ skuSuffix?: string } | null | undefined} [materiau]
 * @param {Record<string, string>} [options]
 * @returns {string}
 */
export function getChassisPricingSku(gamme, materiau, options = {}) {
  if (!gamme?.baseSku) return "";
  const suffix = materiau?.skuSuffix ?? "";
  const chassisSuffix = getChassisSkuSuffixFromOptions(options);
  return gamme.baseSku + suffix + chassisSuffix;
}
