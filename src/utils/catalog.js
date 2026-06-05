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

/**
 * @param {import('../data/catalog.json').gammes[0]} gamme
 */
export function getGroupsForGamme(gamme) {
  if (!gamme) return [];
  return [...gamme.optionGroups, ...gamme.specificOptionGroups];
}
