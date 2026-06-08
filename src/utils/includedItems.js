import { getGammeById } from "./catalog.js";

/**
 * Éléments fournis avec le coffret (hors options configurables).
 * Renseignés dans `catalog.json` → `gammes[].includedItems`.
 *
 * @typedef {{ id?: string, label: string }} IncludedItem
 */

/** Identifiants stables pour lier l'affichage et la nomenclature. */
export const INCLUDED_ITEM_IDS = {
  TERRE_BORNIER: "terre-bornier",
  PANNEAU_RJ45_10: "panneau-rj45-10",
  PANNEAU_RJ45_20: "panneau-rj45-20",
  RAIL_DIN: "rail-din",
};

/**
 * @param {string} [gammeId]
 * @returns {IncludedItem[]}
 */
export function getIncludedItemsForGamme(gammeId) {
  const gamme = getGammeById(gammeId ?? "");
  if (!gamme?.includedItems?.length) return [];

  return gamme.includedItems
    .map((item) => normalizeIncludedItem(item))
    .filter((item) => item.label.length > 0);
}

/**
 * @param {string | IncludedItem} item
 * @returns {IncludedItem}
 */
function normalizeIncludedItem(item) {
  if (typeof item === "string") {
    return { label: item.trim() };
  }
  return {
    id: item.id,
    label: String(item.label ?? "").trim(),
  };
}

/**
 * @param {string} [gammeId]
 * @param {string} itemId
 */
export function gammeIncludesIncludedItem(gammeId, itemId) {
  return getIncludedItemsForGamme(gammeId).some((item) => item.id === itemId);
}
