// @ts-check
import { catalog, getGammeById, getOptionById } from "./catalog.js";
import {
  getVisibleGroups,
  isGroupHidden,
  isOptionSelectable,
} from "./compatibility.js";
import { normalizeCoffretCount, DEFAULT_COFFRET_COUNT } from "./coffretQuantity.js";
import { normalizeCordonRj45Value } from "./cordonRj45.js";
import { getMaxPriseCount, normalizePriseValue } from "./prise.js";
import { getMaxRj45Count, normalizeRj45Value } from "./rj45.js";
import { isQuantityGroup, isQuantityGroupConfigured } from "./quantityGroups.js";

export const DEFAULT_MATERIAU = "grade3";

/**
 * @returns {Record<string, string>}
 */
export function emptyOptions() {
  const opts = {};
  for (const group of Object.keys(catalog.optionGroups)) {
    opts[group] = "";
  }
  return opts;
}

/**
 * Options par défaut selon la gamme (ex. brassage intérieur sur M / ML / MXL).
 * @param {string} gammeId
 * @returns {Record<string, string>}
 */
export function defaultOptionsForGamme(gammeId) {
  const opts = emptyOptions();
  const gamme = getGammeById(gammeId);
  if (gamme?.specificOptionGroups?.includes("brassage")) {
    opts.brassage = "brassage-interieur";
  }
  return opts;
}

/**
 * @param {Record<string, string>} options
 */
export function normalizeLegacyDti(options) {
  const legacy = options.dti;
  if (!legacy) return options;
  const next = { ...options };
  delete next.dti;
  if (legacy === "dti-rj45-4precable" && !next.dti_rj45) {
    next.dti_rj45 = legacy;
  } else if (legacy.startsWith("dti-fibre") && !next.dti_fibre) {
    next.dti_fibre = legacy;
  }
  return next;
}

/**
 * Retire l'ancienne option bornier de terre (désormais incluse systématiquement).
 * @param {Record<string, string>} options
 */
export function stripLegacyTerreOption(options) {
  if (!options.terre) return options;
  const next = { ...options };
  delete next.terre;
  return next;
}

/**
 * @param {Record<string, string>} options
 * @param {string} [gammeId]
 */
export function normalizeOptions(options, gammeId = "") {
  const base = {
    ...emptyOptions(),
    ...stripLegacyTerreOption(normalizeLegacyDti(options)),
  };
  base.rj45 = normalizeRj45Value(base.rj45);
  base.cordon_rj45 = normalizeCordonRj45Value(base.cordon_rj45, gammeId);
  base.prise = normalizePriseValue(base.prise);
  const maxRj45 = getMaxRj45Count(gammeId);
  const rj45Qty = Number.parseInt(base.rj45, 10);
  if (base.rj45 && rj45Qty > maxRj45) base.rj45 = String(maxRj45);
  const maxPrise = getMaxPriseCount(gammeId);
  const priseQty = Number.parseInt(base.prise, 10);
  if (base.prise && priseQty > maxPrise) base.prise = String(maxPrise);
  return base;
}

/**
 * @param {import('./compatibility.js').ConfigState} state
 */
export function withDefaultMateriau(state) {
  if (!state.gammeId) return state;
  const gamme = getGammeById(state.gammeId);
  const validIds = new Set((gamme?.materiaux ?? []).map((m) => m.id));
  let materiau = state.materiau;
  if (!materiau || materiau === "grade2" || !validIds.has(materiau)) {
    materiau = validIds.has(DEFAULT_MATERIAU)
      ? DEFAULT_MATERIAU
      : gamme?.materiaux?.[0]?.id ?? DEFAULT_MATERIAU;
  }
  return materiau === state.materiau ? state : { ...state, materiau };
}

/**
 * @param {import('./compatibility.js').ConfigState} state
 * @returns {{ options: Record<string, string>, warnings: string[] }}
 */
export function sanitizeOptionsForState(state) {
  const warnings = [];
  const normalized = normalizeOptions(state.options ?? {}, state.gammeId);
  const accepted = { ...emptyOptions() };
  const baseState = {
    gammeId: state.gammeId,
    materiau: state.materiau,
    coffretCount: state.coffretCount,
    options: accepted,
  };

  for (const group of Object.keys(catalog.optionGroups)) {
    if (isGroupHidden(group, state)) {
      if (normalized[group]) {
        warnings.push(`Option retirée (groupe masqué) : ${group}`);
      }
      continue;
    }
  }

  for (const group of getVisibleGroups(state)) {
    const value = normalized[group];
    if (!value) continue;

    if (isQuantityGroup(group)) {
      const probe = { ...baseState, options: { ...accepted, [group]: value } };
      if (isQuantityGroupConfigured(group, probe)) {
        accepted[group] = value;
      } else {
        warnings.push(`Quantité retirée : ${group}`);
      }
      continue;
    }

    const option = getOptionById(value);
    if (!option) {
      warnings.push(`Option inconnue retirée : ${value}`);
      continue;
    }

    const probe = { ...baseState, options: { ...accepted, [group]: value } };
    if (isOptionSelectable(value, probe)) {
      accepted[group] = value;
    } else {
      warnings.push(`Option incompatible retirée : ${option.label ?? value}`);
    }
  }

  if (
    getGammeById(state.gammeId)?.specificOptionGroups?.includes("brassage") &&
    !accepted.brassage
  ) {
    accepted.brassage = "brassage-interieur";
  }

  return { options: accepted, warnings };
}

/**
 * @param {Object|null|undefined} source
 * @returns {{ state: import('./compatibility.js').ConfigState, warnings: string[] }|null}
 */
export function validateAndNormalizeConfig(source) {
  if (!source?.gammeId) return null;

  const gamme = getGammeById(source.gammeId);
  if (!gamme) return null;

  const draft = withDefaultMateriau({
    gammeId: source.gammeId,
    materiau: source.materiau ?? DEFAULT_MATERIAU,
    coffretCount: normalizeCoffretCount(source.coffretCount ?? DEFAULT_COFFRET_COUNT),
    options: normalizeOptions(source.options ?? {}, source.gammeId),
  });

  const { options, warnings } = sanitizeOptionsForState(draft);

  return {
    state: { ...draft, options },
    warnings,
  };
}

/**
 * @param {import('./compatibility.js').ConfigState} state
 * @param {string} group
 * @param {string} optionId
 */
export function applyOptionSelection(state, group, optionId) {
  const nextValue = state.options[group] === optionId ? "" : optionId;
  const next = {
    ...state,
    options: { ...state.options, [group]: nextValue },
  };
  const { options } = sanitizeOptionsForState(next);
  return { ...next, options };
}
