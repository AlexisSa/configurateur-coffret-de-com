import { getDefaultPricingTierCode, getPricingTierLabel } from "./pricingTier.js";
import { getSkuTierPriceHT } from "./pricingMatrix.js";
import { pricingConfig } from "./pricingConfig.js";

/**
 * @typedef {{ sku: string, quantity: number, unitPriceHT?: number|null, lineTotalHT?: number|null }} PricedLine
 */

/**
 * @param {string} sku
 * @param {string} [pricingTierCode]
 * @returns {number|null}
 */
export function getUnitPriceHT(sku, pricingTierCode = getDefaultPricingTierCode()) {
  return getSkuTierPriceHT(sku, pricingTierCode);
}

/**
 * @param {PricedLine} line
 * @param {string} [pricingTierCode]
 * @returns {PricedLine}
 */
export function applyPricingToLine(line, pricingTierCode = getDefaultPricingTierCode()) {
  if (line.sku === "INCLUS") {
    return { ...line, unitPriceHT: null, lineTotalHT: null };
  }

  const unitPriceHT = getUnitPriceHT(line.sku, pricingTierCode);
  if (unitPriceHT == null) {
    return { ...line, unitPriceHT: null, lineTotalHT: null };
  }

  const lineTotalHT = Math.round(unitPriceHT * line.quantity * 100) / 100;
  return { ...line, unitPriceHT, lineTotalHT };
}

/**
 * @param {PricedLine[]} lines
 * @param {string} [pricingTierCode]
 */
export function applyPricingToLines(lines, pricingTierCode = getDefaultPricingTierCode()) {
  return lines.map((line) => applyPricingToLine(line, pricingTierCode));
}

/**
 * @param {PricedLine[]} lines
 */
export function getPricedTotalHT(lines) {
  return Math.round(
    lines.reduce((sum, line) => sum + (line.lineTotalHT ?? 0), 0) * 100
  ) / 100;
}

/**
 * @param {number} unitTotalHT
 * @param {number} quantity
 */
export function getOrderTotalHT(unitTotalHT, quantity) {
  const count = Math.max(1, quantity);
  return Math.round(unitTotalHT * count * 100) / 100;
}

/**
 * @param {PricedLine[]} lines
 */
export function hasPricedLines(lines) {
  return lines.some((line) => line.lineTotalHT != null);
}

/**
 * @returns {number}
 */
export function getVatRate() {
  const rate = pricingConfig.vatRate;
  return typeof rate === "number" && rate >= 0 ? rate : 0.2;
}

/**
 * @param {number} totalHT
 * @returns {number}
 */
export function getTotalTTC(totalHT) {
  return Math.round(totalHT * (1 + getVatRate()) * 100) / 100;
}

/**
 * @returns {string}
 */
export function formatVatLabel() {
  return `TVA ${Math.round(getVatRate() * 100)} %`;
}

/**
 * @param {number|null|undefined} amount
 */
export function formatPriceHT(amount) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * @param {string} [pricingTierCode]
 * @returns {string}
 */
export function getPricingDisclaimer(pricingTierCode = getDefaultPricingTierCode()) {
  const text = pricingConfig.disclaimer?.trim();
  const isPublicTier = pricingTierCode === "S";
  const tierNote = isPublicTier
    ? `Tarif appliqué : ${getPricingTierLabel(pricingTierCode)}.`
    : "";

  if (!text) return tierNote;
  if (!tierNote) return text;
  return `${text} ${tierNote}`;
}
