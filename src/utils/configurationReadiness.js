// @ts-check
import { getOptionById } from "./catalog.js";
import {
  getOptionsInGroup,
  getVisibleGroups,
  isOptionSelectable,
} from "./compatibility.js";
import { defaultOptionsForGamme } from "./configSanitizer.js";
import { getGroupMeta } from "./bomBuilder.js";
import { isGroupConfigured, isGroupResolved, isGroupAcknowledged } from "./progress.js";
import { isQuantityGroup } from "./quantityGroups.js";

/**
 * @param {string} gammeId
 * @returns {Record<string, string>}
 */
export function getDefaultOptionsForGamme(gammeId) {
  return defaultOptionsForGamme(gammeId);
}

/**
 * Valeur du groupe identique au défaut automatique de la gamme.
 * @param {string} group
 * @param {import('./compatibility.js').ConfigState} state
 */
export function isDefaultGammeOption(group, state) {
  if (!state.gammeId) return false;
  const defaults = getDefaultOptionsForGamme(state.gammeId);
  const value = state.options[group] ?? "";
  const defaultValue = defaults[group] ?? "";
  return Boolean(value) && value === defaultValue;
}

/**
 * Option choisie par l'utilisateur (hors défaut automatique de la gamme).
 * @param {string} group
 * @param {import('./compatibility.js').ConfigState} state
 */
export function isUserConfiguredOption(group, state) {
  if (!isGroupConfigured(group, state)) return false;
  return !isDefaultGammeOption(group, state);
}

/**
 * @param {import('./compatibility.js').ConfigState} state
 */
export function hasNonDefaultConfiguredOptions(state) {
  if (!state.gammeId) return false;
  return getVisibleGroups(state).some((group) =>
    isUserConfiguredOption(group, state)
  );
}

/**
 * Configuration prête pour PDF, partage et devis.
 * @param {import('./compatibility.js').ConfigState} state
 */
export function isConfigurationReady(state) {
  return hasNonDefaultConfiguredOptions(state);
}

/**
 * @param {import('./compatibility.js').ConfigState} state
 * @param {Record<string, boolean>} [acknowledgedGroups]
 * @returns {{ configured: number, total: number, groups: string[] }}
 */
export function getConfiguredGroupsProgress(state, acknowledgedGroups) {
  const groups = getVisibleGroups(state);
  const configured = groups.filter((group) =>
    isGroupResolved(group, state, acknowledgedGroups)
  ).length;
  return { configured, total: groups.length, groups };
}

/**
 * Indication contextuelle sous le titre d'un accordéon.
 * @param {string} group
 * @param {import('./compatibility.js').ConfigState} state
 * @param {Record<string, boolean>} [acknowledgedGroups]
 * @returns {string|null}
 */
export function getGroupAccordionHint(group, state, acknowledgedGroups) {
  if (!state.gammeId) return null;

  if (isDefaultGammeOption(group, state)) {
    const option = getOptionById(state.options[group]);
    if (option?.label) {
      return `Pré-sélectionné : ${option.label}`;
    }
  }

  if (isQuantityGroup(group)) {
    if (!isGroupResolved(group, state, acknowledgedGroups)) {
      return "Choisissez une quantité ou cliquez sur « Aucun » pour continuer";
    }
    return null;
  }

  const meta = getGroupMeta(group);
  if (
    meta.optional &&
    !state.options[group] &&
    !isGroupAcknowledged(group, acknowledgedGroups)
  ) {
    return "Cliquez sur « Aucun » ou choisissez une option pour continuer";
  }

  const options = getOptionsInGroup(group, state);
  if (options.length === 0) return null;

  const selectable = options.filter((opt) =>
    isOptionSelectable(opt.id, state)
  );
  if (selectable.length > 0) return null;

  const blocked = options.find((opt) => !isOptionSelectable(opt.id, state));
  if (!blocked) return null;

  for (const selectedId of Object.values(state.options)) {
    if (!selectedId) continue;
    const other = getOptionById(selectedId);
    if (!other || other.group === group) continue;
    const excludes =
      getOptionById(blocked.id)?.rules?.excludes?.includes(selectedId) ||
      other.rules?.excludes?.includes(blocked.id);
    if (excludes && other.label) {
      return `Incompatible avec : ${other.label}`;
    }
  }

  return "Aucune option disponible pour cette gamme";
}
