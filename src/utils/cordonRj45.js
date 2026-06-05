import { getOptionById } from "./catalog.js";
import { isGroupHidden } from "./compatibility.js";
import { getMaxRj45Count } from "./rj45.js";

/** @typedef {import('./compatibility.js').ConfigState} ConfigState */

const CORDON_OPTION_ID = "cordon-rj45-050";

/** @param {string|undefined} value */
export function parseCordonRj45Quantity(value) {
  if (!value) return 0;
  if (value === CORDON_OPTION_ID) return 1;
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * @param {string|undefined} value
 * @param {string} gammeId
 */
export function normalizeCordonRj45Value(value, gammeId = "") {
  const qty = parseCordonRj45Quantity(value);
  if (qty < 1) return "";
  const max = getMaxRj45Count(gammeId);
  return String(Math.min(qty, max));
}

/**
 * @param {number} quantity
 * @param {string} gammeId
 * @returns {string|null}
 */
export function getCordonRj45QuantityError(quantity, gammeId) {
  if (!gammeId) return "Choisissez d'abord la gamme";
  if (!quantity || quantity < 1) return null;

  const max = getMaxRj45Count(gammeId);
  if (quantity > max) {
    return `Maximum ${max} cordon${max > 1 ? "s" : ""} pour ce coffret`;
  }

  return getOptionById(CORDON_OPTION_ID) ? null : "Option indisponible";
}

/**
 * @param {ConfigState} state
 * @returns {import('./catalog.js').ReturnType<typeof getOptionById>|null}
 */
export function getCordonRj45Option(state) {
  if (!state.gammeId || isGroupHidden("cordon_rj45", state)) return null;
  return getOptionById(CORDON_OPTION_ID);
}
