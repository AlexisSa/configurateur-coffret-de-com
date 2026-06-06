import catalogData from "../data/catalog.json";

/** @typedef {typeof catalogData} Catalog */

export const catalog = catalogData;

/**
 * @param {string} gammeId
 */
export function getGammeById(gammeId) {
  return catalog.gammes.find((g) => g.id === gammeId) ?? null;
}

/**
 * @param {string} optionId
 */
export function getOptionById(optionId) {
  return catalog.options.find((o) => o.id === optionId) ?? null;
}

/** Groupes affichés en tête de liste lorsqu'ils sont disponibles pour la gamme. */
const PRIORITY_OPTION_GROUPS = ["brassage"];

/**
 * @param {import('../data/catalog.json').gammes[0]} gamme
 */
export function getGroupsForGamme(gamme) {
  if (!gamme) return [];
  const all = [...gamme.optionGroups, ...gamme.specificOptionGroups];
  const priority = PRIORITY_OPTION_GROUPS.filter((group) => all.includes(group));
  const rest = all.filter((group) => !PRIORITY_OPTION_GROUPS.includes(group));
  return [...priority, ...rest];
}
