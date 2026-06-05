import pricingMatrixData from "../data/pricingMatrix.json";
import { catalog } from "./catalog.js";
import { getDefaultPricingTierCode } from "./pricingTier.js";

const LOT_24_SIZE = 24;
const TIER_CODES = /** @type {const} */ (["S", "M", "B", "A", "Z"]);
const skuPrices = /** @type {Record<string, Partial<Record<(typeof TIER_CODES)[number], number|null>>>} */ (
  pricingMatrixData.skus ?? {}
);

/**
 * @param {string} sku
 * @returns {Partial<Record<(typeof TIER_CODES)[number], number|null>>|undefined}
 */
export function getSkuTierPrices(sku) {
  return skuPrices[sku];
}

/**
 * @param {string} sku
 * @param {string} tierCode
 * @returns {number|null}
 */
export function getSkuTierPriceHT(sku, tierCode = getDefaultPricingTierCode()) {
  const lotPrice = getLot24TierPriceHT(sku, tierCode);
  if (lotPrice != null) return lotPrice;

  const tiers = getSkuTierPrices(sku);
  if (!tiers) return null;

  const tierPrice = tiers[tierCode];
  return typeof tierPrice === "number" ? tierPrice : null;
}

/**
 * @param {string} sku
 * @param {string} tierCode
 * @returns {number|null}
 */
function getLot24TierPriceHT(sku, tierCode) {
  const embase = catalog.components?.embaseRj45;
  if (!embase?.skuLot24 || embase.skuLot24 !== sku) return null;

  const tiers = getSkuTierPrices(embase.sku);
  if (!tiers) return null;

  const unitPrice = tiers[tierCode];
  if (typeof unitPrice !== "number") return null;

  return Math.round(unitPrice * LOT_24_SIZE * 100) / 100;
}

/**
 * @returns {string[]}
 */
export function listPricedSkus() {
  return Object.keys(skuPrices);
}
