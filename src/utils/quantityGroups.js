// @ts-check
import { parseCordonRj45Quantity } from "./cordonRj45.js";
import { parsePriseQuantity } from "./prise.js";
import { parseRj45Quantity } from "./rj45.js";
import { getMaxRj45Count, getRj45QuantityError } from "./rj45.js";
import { getMaxPriseCount, getPriseQuantityError } from "./prise.js";
import { getCordonRj45QuantityError } from "./cordonRj45.js";

/** @typedef {import('./compatibility.js').ConfigState} ConfigState */

export const QUANTITY_GROUP_IDS = /** @type {const} */ ([
  "rj45",
  "prise",
  "cordon_rj45",
]);

/** @type {Record<string, { parse: (v: string|undefined) => number, getMax: (gammeId: string) => number, getError: (qty: number, gammeId: string) => string|null }>} */
export const quantityGroupHandlers = {
  rj45: {
    parse: parseRj45Quantity,
    getMax: getMaxRj45Count,
    getError: getRj45QuantityError,
  },
  prise: {
    parse: parsePriseQuantity,
    getMax: getMaxPriseCount,
    getError: getPriseQuantityError,
  },
  cordon_rj45: {
    parse: parseCordonRj45Quantity,
    getMax: getMaxRj45Count,
    getError: getCordonRj45QuantityError,
  },
};

/**
 * @param {string} group
 */
export function isQuantityGroup(group) {
  return QUANTITY_GROUP_IDS.includes(/** @type {typeof QUANTITY_GROUP_IDS[number]} */ (group));
}

/**
 * @param {string} group
 * @param {ConfigState} state
 */
export function isQuantityGroupConfigured(group, state) {
  const handler = quantityGroupHandlers[group];
  if (!handler) return false;
  const qty = handler.parse(state.options[group]);
  return qty > 0 && handler.getError(qty, state.gammeId) === null;
}

/**
 * @param {string} group
 * @param {ConfigState} state
 */
export function hasQuantityGroupValue(group, state) {
  const handler = quantityGroupHandlers[group];
  if (!handler) return false;
  return handler.parse(state.options[group]) > 0;
}

/**
 * @param {string} group
 * @param {ConfigState} state
 * @param {number} quantity
 */
export function clampQuantityForGroup(group, gammeId, quantity) {
  const handler = quantityGroupHandlers[group];
  if (!handler) return quantity;
  const max = handler.getMax(gammeId);
  return Math.min(Math.max(1, quantity), max);
}
