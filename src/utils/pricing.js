import { catalog } from "./catalog.js";

const LOT_24_SIZE = 24;

/**
 * @param {string} sku
 * @returns {number|null}
 */
export function getUnitPriceHT(sku) {
  const gammePrice = getGammeUnitPriceHT(sku);
  if (gammePrice != null) return gammePrice;

  const embase = catalog.components?.embaseRj45;
  if (embase?.sku === sku) return embase.unitPriceHT ?? null;
  if (embase?.skuLot24 === sku && embase.unitPriceHT != null) {
    return Math.round(embase.unitPriceHT * LOT_24_SIZE * 100) / 100;
  }

  const option = catalog.options.find((o) => o.sku === sku);
  return option?.unitPriceHT ?? null;
}

/**
 * Prix HT du châssis (toutes variantes SKU : baseSku + suffixe matériau).
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
export function applyPricingToLine(line) {
  if (line.sku === "INCLUS") {
    return { ...line, unitPriceHT: null, lineTotalHT: null };
  }

  const unitPriceHT = getUnitPriceHT(line.sku);
  if (unitPriceHT == null) {
    return { ...line, unitPriceHT: null, lineTotalHT: null };
  }

  const lineTotalHT = Math.round(unitPriceHT * line.quantity * 100) / 100;
  return { ...line, unitPriceHT, lineTotalHT };
}

/**
 * @param {import('./bomBuilder.js').BomLine[]} bom
 */
export function applyPricingToBom(bom) {
  return bom.map(applyPricingToLine);
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
export function getPricingDisclaimer() {
  const text = catalog.meta?.pricing?.disclaimer?.trim();
  return text || "";
}
