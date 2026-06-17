import {
  formatPriceHT,
  formatVatLabel,
  getOrderTotalHT,
  getPricedTotalHT,
  getTotalTTC,
  hasPricedLines,
} from "./pricing.js";

/**
 * @param {number} count
 * @param {number} [min=1]
 * @param {number} [max=1000]
 */
export function normalizeQuantity(count, min = 1, max = 1000) {
  const value = Number.parseInt(String(count), 10);
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/**
 * @param {import('./pricing.js').PricedLine[]} lines
 * @param {number} [quantity]
 */
export function getOrderPricingSummary(lines, quantity = 1) {
  const count = normalizeQuantity(quantity);
  const unitTotalHT = getPricedTotalHT(lines);
  const orderTotalHT = getOrderTotalHT(unitTotalHT, count);

  return {
    showPrices: hasPricedLines(lines),
    quantity: count,
    unitTotalHT,
    orderTotalHT,
    unitTotalTTC: getTotalTTC(unitTotalHT),
    orderTotalTTC: getTotalTTC(orderTotalHT),
  };
}

/**
 * @param {import('./pricing.js').PricedLine[]} lines
 * @param {number} [quantity]
 * @param {{ quantityLabel?: string, pluralLabel?: string }} [labels]
 */
export function getOrderPricingLines(lines, quantity = 1, labels = {}) {
  const quantityLabel = labels.quantityLabel ?? "unité";
  const pluralLabel = labels.pluralLabel ?? `${quantityLabel}s`;
  const summary = getOrderPricingSummary(lines, quantity);
  if (!summary.showPrices) return [];

  const countLabel = summary.quantity > 1 ? pluralLabel : quantityLabel;
  const linesOut = [{ label: "Prix unitaire HT", amount: summary.unitTotalHT }];

  if (summary.quantity > 1) {
    linesOut.push({
      label: `Total HT (${summary.quantity} ${countLabel})`,
      amount: summary.orderTotalHT,
    });
    linesOut.push({
      label: `TTC · ${formatVatLabel()} (${summary.quantity} ${countLabel})`,
      amount: summary.orderTotalTTC,
      highlight: true,
    });
  } else {
    linesOut.push({ label: "Total HT", amount: summary.unitTotalHT });
    linesOut.push({
      label: `TTC · ${formatVatLabel()}`,
      amount: summary.unitTotalTTC,
      highlight: true,
    });
  }

  return linesOut;
}

/**
 * @param {import('./pricing.js').PricedLine[]} lines
 * @param {number} [quantity]
 * @param {{ quantityLabel?: string, pluralLabel?: string }} [labels]
 */
export function formatOrderPricingText(lines, quantity = 1, labels) {
  return getOrderPricingLines(lines, quantity, labels)
    .map((line) => `${line.label} : ${formatPriceHT(line.amount)}`)
    .join("\n");
}
