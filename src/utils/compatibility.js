import { catalog, getGammeById, getOptionById, getGroupsForGamme } from "./catalog.js";

/**
 * @typedef {Object} ConfigState
 * @property {string} gammeId
 * @property {string} materiau
 * @property {number} [coffretCount]
 * @property {Record<string, string>} options
 */

/**
 * @param {Record<string, unknown>} ruleIf
 * @param {import('./catalog.js').ReturnType<typeof getGammeById>} gamme
 */
function matchesGammeCondition(ruleIf, gamme) {
  if (!gamme || !ruleIf) return false;

  if (ruleIf.gamme && ruleIf.gamme !== gamme.id) return false;

  if (ruleIf.gammeAttribute) {
    const val = gamme.attributes[ruleIf.gammeAttribute];
    if (ruleIf.not !== undefined) return val !== ruleIf.not;
    if (ruleIf.eq !== undefined) return val === ruleIf.eq;
  }

  return !ruleIf.gammeAttribute || Boolean(ruleIf.gamme);
}

/**
 * @param {string} group
 * @param {ConfigState} state
 */
export function getOptionsInGroup(group, state) {
  const gamme = getGammeById(state.gammeId);
  if (!gamme) return [];

  const groups = getGroupsForGamme(gamme);
  if (!groups.includes(group)) return [];

  return catalog.options.filter((opt) => {
    if (opt.group !== group) return false;
    if (opt.rules?.gammes && !opt.rules.gammes.includes(state.gammeId)) {
      return false;
    }
    return true;
  });
}

/**
 * @param {string} group
 * @param {ConfigState} state
 */
export function isGroupHidden(group, state) {
  const gamme = getGammeById(state.gammeId);
  if (!gamme) return true;

  if (!getGroupsForGamme(gamme).includes(group)) return true;

  for (const rule of catalog.rules) {
    if (!rule.hideGroups?.includes(group)) continue;
    if (rule.if?.gamme === state.gammeId) return true;
    if (rule.if?.gammeAttribute && matchesGammeCondition(rule.if, gamme)) {
      return true;
    }
  }
  return false;
}

/**
 * @param {object} option
 * @param {ConfigState} state
 */
function satisfiesGammeAttributeRules(option, state) {
  const gamme = getGammeById(state.gammeId);
  if (!gamme || !option.rules?.requireGammeAttribute) return true;

  for (const [attr, constraint] of Object.entries(
    option.rules.requireGammeAttribute
  )) {
    const value = gamme.attributes[attr];
    if (typeof constraint === "object" && constraint !== null) {
      if (constraint.gte !== undefined && (value ?? 0) < constraint.gte) {
        return false;
      }
    } else if (value !== constraint) {
      return false;
    }
  }
  return true;
}

/**
 * @param {string} optionId
 * @param {ConfigState} state
 * @returns {string|null}
 */
export function getIncompatibilityReason(optionId, state) {
  const option = getOptionById(optionId);
  const gamme = getGammeById(state.gammeId);

  if (!option || !gamme) return "Configuration incomplète";

  if (option.rules?.gammes && !option.rules.gammes.includes(state.gammeId)) {
    return "Non compatible avec cette gamme";
  }

  if (!satisfiesGammeAttributeRules(option, state)) {
    return "Non compatible avec les caractéristiques de ce coffret";
  }

  for (const rule of catalog.rules) {
    if (rule.if?.option === optionId && rule.require) {
      const { gammeAttribute, gte } = rule.require;
      const val = gamme.attributes[gammeAttribute];
      if (gte !== undefined && (val ?? 0) < gte) {
        return `Nécessite une gamme avec ${gammeAttribute} ≥ ${gte}`;
      }
    }
  }

  const excludes = option.rules?.excludes ?? [];
  for (const selectedId of Object.values(state.options)) {
    if (!selectedId || selectedId === optionId) continue;
    const other = getOptionById(selectedId);
    // Même groupe : clic = remplacement, pas blocage
    if (!other || other.group === option.group) continue;

    const mutuallyExcluded =
      excludes.includes(selectedId) ||
      other.rules?.excludes?.includes(optionId);
    if (mutuallyExcluded) {
      return `Incompatible avec : ${other.label ?? selectedId}`;
    }
  }

  return null;
}

/**
 * @param {string} optionId
 * @param {ConfigState} state
 */
export function isOptionSelectable(optionId, state) {
  if (!state.gammeId || !state.materiau) return false;
  return getIncompatibilityReason(optionId, state) === null;
}

/**
 * @param {ConfigState} state
 */
export function getVisibleGroups(state) {
  if (!state.gammeId) return [];
  const gamme = getGammeById(state.gammeId);
  if (!gamme) return [];

  return getGroupsForGamme(gamme).filter((g) => !isGroupHidden(g, state));
}

/**
 * @param {ConfigState} state
 */
export function isConfigurationComplete(state) {
  return Boolean(state.gammeId && state.materiau);
}
