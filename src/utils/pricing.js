import { catalog } from "./catalog.js";
import { getDefaultPricingTierCode, getPricingTierLabel } from "./pricingTier.js";
import { getSkuTierPriceHT } from "./pricingMatrix.js";

/**
 * @param {string} sku
 * @param {string} [pricingTierCode]
 * @returns {number|null}
 */
export function getUnitPriceHT(sku, pricingTierCode = getDefaultPricingTierCode()) {
  return getSkuTierPriceHT(sku, pricingTierCode);
}

/**
 * Prix HT du châssis (toutes variantes SKU : baseSku + suffixe matériau).
 * Conservé pour les tests et la compatibilité interne.
 * @param {string} sku
 * @returns {number|null}
 */
export function getGammeUnitPriceHT(sku) {
  for (const gamme of catalog.gammes) {
    if (gamme.unitPriceHT == null) continue;
    const skus = [gamme.baseSku];
    for (const materiau of gamme.materiaux ?? []) {
      skus.push(gamme.baseSku + (materiau.skuSuffix ?? ""));
    }
    if (skus.includes(sku)) return gamme.unitPriceHT;
  }
  return null;
}

/**
 * @param {import('./bomBuilder.js').BomLine} line
 * @returns {import('./bomBuilder.js').BomLine}
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
 * @param {import('./bomBuilder.js').BomLine[]} bom
 * @param {string} [pricingTierCode]
 */
export function applyPricingToBom(bom, pricingTierCode = getDefaultPricingTierCode()) {
  return bom.map((line) => applyPricingToLine(line, pricingTierCode));
}

/**
 * @param {import('./bomBuilder.js').BomLine[]} bom
 */
export function getPricedTotalHT(bom) {
  return Math.round(
    bom.reduce((sum, line) => sum + (line.lineTotalHT ?? 0), 0) * 100
  ) / 100;
}

/**
 * @param {import('./bomBuilder.js').BomLine[]} bom
 */
export function hasPricedLines(bom) {
  return bom.some((line) => line.lineTotalHT != null);
}

/**
 * Taux de TVA applicable (par défaut 20 %).
 * @returns {number}
 */
export function getVatRate() {
  const rate = catalog.meta?.pricing?.vatRate;
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
 * @returns {string}
 */
export function getPricingDisclaimer(pricingTierCode = getDefaultPricingTierCode()) {
  const text = catalog.meta?.pricing?.disclaimer?.trim();
  const tierLabel = getPricingTierLabel(pricingTierCode);
  const tierNote = `Tarif appliqué : ${tierLabel}.`;

  if (!text) return tierNote;
  return `${text} ${tierNote}`;
}
