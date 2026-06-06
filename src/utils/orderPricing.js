import { normalizeCoffretCount } from "./coffretQuantity.js";
import {
  formatPriceHT,
  formatVatLabel,
  getOrderTotalHT,
  getPricedTotalHT,
  getTotalTTC,
  hasPricedLines,
} from "./pricing.js";

/**
 * Totaux unitaire et commande pour une nomenclature « par coffret ».
 * @param {import('./bomBuilder.js').BomLine[]} bom
 * @param {number} [coffretCount]
 */
export function getOrderPricingSummary(bom, coffretCount = 1) {
  const count = normalizeCoffretCount(coffretCount);
  const unitTotalHT = getPricedTotalHT(bom);
  const orderTotalHT = getOrderTotalHT(unitTotalHT, count);

  return {
    showPrices: hasPricedLines(bom),
    coffretCount: count,
    unitTotalHT,
    orderTotalHT,
    unitTotalTTC: getTotalTTC(unitTotalHT),
    orderTotalTTC: getTotalTTC(orderTotalHT),
  };
}

/**
 * Lignes de totaux pour récap, email et PDF.
 * @param {import('./bomBuilder.js').BomLine[]} bom
 * @param {number} [coffretCount]
 * @returns {Array<{ label: string, amount: number, highlight?: boolean }>}
 */
export function getOrderPricingLines(bom, coffretCount = 1) {
  const summary = getOrderPricingSummary(bom, coffretCount);
  if (!summary.showPrices) return [];

  const lines = [
    { label: "Prix unitaire HT", amount: summary.unitTotalHT },
  ];

  if (summary.coffretCount > 1) {
    lines.push({
      label: `Total HT (${summary.coffretCount} coffrets)`,
      amount: summary.orderTotalHT,
    });
    lines.push({
      label: `TTC · ${formatVatLabel()} (${summary.coffretCount} coffrets)`,
      amount: summary.orderTotalTTC,
      highlight: true,
    });
  } else {
    lines.push({ label: "Total HT", amount: summary.unitTotalHT });
    lines.push({
      label: `TTC · ${formatVatLabel()}`,
      amount: summary.unitTotalTTC,
      highlight: true,
    });
  }

  return lines;
}

/**
 * @param {import('./bomBuilder.js').BomLine[]} bom
 * @param {number} [coffretCount]
 */
export function formatOrderPricingText(bom, coffretCount = 1) {
  return getOrderPricingLines(bom, coffretCount)
    .map((line) => `${line.label} : ${formatPriceHT(line.amount)}`)
    .join("\n");
}
