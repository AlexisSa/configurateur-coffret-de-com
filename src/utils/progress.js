import { getVisibleGroups } from "./compatibility.js";
import { getGroupMeta } from "./bomBuilder.js";
import { hasNonDefaultConfiguredOptions } from "./configurationReadiness.js";
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
  return hasNonDefaultConfiguredOptions(state);
}

/**
 * Indique si l'utilisateur a explicitement validé « Aucun » pour ce groupe.
 * @param {string} group
 * @param {Record<string, boolean>} [acknowledgedGroups]
 */
export function isGroupAcknowledged(group, acknowledgedGroups) {
  return Boolean(acknowledgedGroups?.[group]);
}

/**
 * Le groupe a une valeur ou a été explicitement passé (Aucun).
 * @param {string} group
 * @param {import('./compatibility.js').ConfigState} state
 * @param {Record<string, boolean>} [acknowledgedGroups]
 */
export function isGroupResolved(group, state, acknowledgedGroups) {
  if (isGroupConfigured(group, state)) return true;
  return isGroupAcknowledged(group, acknowledgedGroups);
}

/**
 * Indique si le bouton « Aucun » doit être affiché pour un groupe quantité.
 * @param {string} group
 * @param {import('./compatibility.js').ConfigState} state
 */
export function canClearQuantityGroup(group, state) {
  return isQuantityGroup(group) && hasQuantityGroupValue(group, state);
}

/**
 * Indique si le bouton « Aucun » de l'accordéon doit être proposé.
 * @param {string} group
 * @param {import('./compatibility.js').ConfigState} state
 */
export function shouldShowAccordionClear(group, state) {
  const meta = getGroupMeta(group);
  if (meta.optional || isQuantityGroup(group)) return true;
  return Boolean(state.options[group]);
}

/**
 * « Aucun » a été choisi explicitement (pas l'état initial vide).
 * @param {string} group
 * @param {import('./compatibility.js').ConfigState} state
 * @param {Record<string, boolean>} [acknowledgedGroups]
 */
export function isExplicitNoneChoice(group, state, acknowledgedGroups) {
  if (isGroupConfigured(group, state)) return false;
  return isGroupAcknowledged(group, acknowledgedGroups);
}

export function isAccordionClearActive(group, state, acknowledgedGroups) {
  return isExplicitNoneChoice(group, state, acknowledgedGroups);
}

/**
 * Groupe nouvellement marqué comme passé (Aucun).
 * @param {Record<string, boolean>} prev
 * @param {Record<string, boolean>} next
 * @returns {string|null}
 */
export function getNewlyAcknowledgedGroup(prev, next) {
  for (const group of Object.keys(next)) {
    if (next[group] && !prev[group]) return group;
  }
  return null;
}

/**
 * Groupe dont la valeur a changé entre deux états d'options.
 * @param {Record<string, string>} prev
 * @param {Record<string, string>} next
 * @returns {string|null}
 */
export function getChangedOptionGroup(prev, next) {
  const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  for (const group of keys) {
    if ((prev[group] ?? "") !== (next[group] ?? "")) return group;
  }
  return null;
}

/**
 * Prochain accordéon à ouvrir après une sélection ou un « Aucun » explicite.
 * @param {import('./compatibility.js').ConfigState} state
 * @param {string} currentGroup
 * @param {string|null} changedGroup
 * @param {string|null} newlyAcknowledged
 * @param {Record<string, boolean>} [acknowledgedGroups]
 * @returns {string|null}
 */
export function getNextAccordionGroup(
  state,
  currentGroup,
  changedGroup,
  newlyAcknowledged,
  acknowledgedGroups
) {
  const resolved = isGroupResolved(currentGroup, state, acknowledgedGroups);
  if (!resolved) return null;

  const userAction =
    changedGroup === currentGroup || newlyAcknowledged === currentGroup;
  if (!userAction) return null;

  const groups = getVisibleGroups(state);
  return groups.find((group) => !isGroupResolved(group, state, acknowledgedGroups)) ?? null;
}
