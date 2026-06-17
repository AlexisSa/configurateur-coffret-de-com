import pricingTiersData from "../data/pricingTiers.json";

/** @typedef {{ code: string, label: string, categoryId: string }} PricingTier */

const tiers = /** @type {PricingTier[]} */ (pricingTiersData.tiers);
const defaultTierCode = pricingTiersData.defaultTier ?? "S";

const tierByCode = new Map(tiers.map((tier) => [tier.code, tier]));
const tierByCategoryId = new Map();

for (const tier of tiers) {
  const id = String(tier.categoryId).trim();
  tierByCategoryId.set(id, tier);
  const numericId = Number(id);
  if (Number.isFinite(numericId)) {
    tierByCategoryId.set(numericId, tier);
  }
}

/**
 * @returns {string}
 */
export function getDefaultPricingTierCode() {
  return defaultTierCode;
}

/**
 * @param {string} code
 * @returns {PricingTier|null}
 */
export function getPricingTierByCode(code) {
  return tierByCode.get(code) ?? null;
}

/**
 * Résout une catégorie Oxatis (ID) ou un code tarif (S, M, B, A, Z).
 * @param {string|number|null|undefined} value
 * @returns {string}
 */
export function resolvePricingTierCode(value) {
  if (value == null) return defaultTierCode;

  const normalized = String(value).trim();
  if (!normalized) return defaultTierCode;

  if (tierByCategoryId.has(normalized)) {
    return tierByCategoryId.get(normalized).code;
  }

  const upper = normalized.toUpperCase();
  if (tierByCode.has(upper)) return upper;

  return defaultTierCode;
}

/**
 * @param {string} tierCode
 * @returns {PricingTier}
 */
export function getPricingTier(tierCode) {
  return getPricingTierByCode(tierCode) ?? tierByCode.get(defaultTierCode);
}

/**
 * @param {string} [tierCode]
 * @returns {string}
 */
export function getPricingTierLabel(tierCode = defaultTierCode) {
  return getPricingTier(tierCode).label;
}
