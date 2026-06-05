import { getVisibleGroups } from "./compatibility.js";
import { parseCordonRj45Quantity } from "./cordonRj45.js";
import { parsePriseQuantity } from "./prise.js";
import { parseRj45Quantity } from "./rj45.js";

/**
 * Indique si un groupe d'options a une sélection explicite (hors défaut « aucun »).
 * @param {string} group
 * @param {import('./compatibility.js').ConfigState} state
 * @returns {boolean}
 */
export function isGroupConfigured(group, state) {
  if (group === "rj45") {
    return parseRj45Quantity(state.options.rj45) > 0;
  }
  if (group === "prise") {
    return parsePriseQuantity(state.options.prise) > 0;
  }
  if (group === "cordon_rj45") {
    return parseCordonRj45Quantity(state.options.cordon_rj45) > 0;
  }
  return Boolean(state.options[group]);
}

/**
 * Au moins une option a été configurée dans les groupes visibles.
 * @param {import('./compatibility.js').ConfigState} state
 * @returns {boolean}
 */
export function hasConfiguredOptions(state) {
  return getVisibleGroups(state).some((group) => isGroupConfigured(group, state));
}

/**
 * Étape options considérée comme terminée.
 * @param {import('./compatibility.js').ConfigState} state
 * @param {{ optionsSkipped?: boolean }} [opts]
 * @returns {boolean}
 */
export function isOptionsStepComplete(state, opts = {}) {
  if (!state.gammeId) return false;
  return hasConfiguredOptions(state) || Boolean(opts.optionsSkipped);
}
