import { getGammeById, getOptionById } from "./catalog.js";
import { isGroupHidden } from "./compatibility.js";

/** @typedef {import('./compatibility.js').ConfigState} ConfigState */

export const MAX_PRISE_COUNT = 2;
const PRISE_OPTION_ID = "prise-2pt";

/** @param {string|undefined} value */
export function parsePriseQuantity(value) {
  if (!value) return 0;
  if (value === PRISE_OPTION_ID) return 1;
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** @param {string|undefined} value */
export function normalizePriseValue(value) {
  const qty = parsePriseQuantity(value);
  if (qty < 1) return "";
  return String(Math.min(qty, MAX_PRISE_COUNT));
}

/**
 * @param {string} gammeId
 * @returns {number}
 */
export function getMaxPriseCount(gammeId) {
  void gammeId;
  return MAX_PRISE_COUNT;
}

/**
 * @param {number} quantity
 * @param {string} gammeId
 * @returns {string|null}
 */
export function getPriseQuantityError(quantity, gammeId) {
  if (!gammeId) return "Choisissez d'abord la gamme";
  if (!quantity || quantity < 1) return null;

  const gamme = getGammeById(gammeId);
  if (!gamme || gamme.attributes.priseMode !== "option") {
    return "Prises non disponibles sur ce coffret";
  }

  if (quantity > MAX_PRISE_COUNT) {
    return `Maximum ${MAX_PRISE_COUNT} prises en option`;
  }

  const option = getOptionById(PRISE_OPTION_ID);
  if (!option) return null;

  return null;
}

/**
 * @param {ConfigState} state
 * @returns {import('./catalog.js').ReturnType<typeof getOptionById>|null}
 */
export function getPriseOption(state) {
  if (!state.gammeId || isGroupHidden("prise", state)) return null;
  return getOptionById(PRISE_OPTION_ID);
}
