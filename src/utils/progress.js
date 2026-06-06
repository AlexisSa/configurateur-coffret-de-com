import { getVisibleGroups } from "./compatibility.js";
import {
  isQuantityGroup,
  isQuantityGroupConfigured,
  hasQuantityGroupValue,
} from "./quantityGroups.js";

/**
 * Indique si un groupe d'options a une sélection explicite (hors défaut « aucun »).
 * @param {string} group
 * @param {import('./compatibility.js').ConfigState} state
 * @returns {boolean}
 */
export function isGroupConfigured(group, state) {
  if (isQuantityGroup(group)) {
    return isQuantityGroupConfigured(group, state);
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
 * @returns {boolean}
 */
export function isOptionsStepComplete(state) {
  if (!state.gammeId) return false;
  return hasConfiguredOptions(state);
}

/**
 * Indique si le bouton « Aucun » doit être affiché pour un groupe quantité.
 * @param {string} group
 * @param {import('./compatibility.js').ConfigState} state
 */
export function canClearQuantityGroup(group, state) {
  return isQuantityGroup(group) && hasQuantityGroupValue(group, state);
}
