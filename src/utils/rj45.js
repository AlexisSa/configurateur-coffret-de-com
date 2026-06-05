import { getGammeById } from "./catalog.js";

export const RJ45_QUANTITY_PRESETS = [2, 4, 6, 8, 10];

/**
 * @param {number} max
 * @returns {number[]}
 */
export function getRj45QuantityPresets(max) {
  return RJ45_QUANTITY_PRESETS.filter((n) => n <= max);
}

/** @param {string|undefined} value */
export function parseRj45Quantity(value) {
  if (!value) return 0;
  const legacy = value.match(/^rj45-(\d+)$/);
  if (legacy) return Number.parseInt(legacy[1], 10);
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** @param {string|undefined} value */
export function normalizeRj45Value(value) {
  const qty = parseRj45Quantity(value);
  return qty > 0 ? String(qty) : "";
}

/**
 * @param {string} gammeId
 * @returns {number}
 */
export function getMaxRj45Count(gammeId) {
  const gamme = getGammeById(gammeId);
  return gamme?.attributes?.maxRj45 ?? 10;
}

/**
 * @param {number} quantity
 * @param {string} gammeId
 * @returns {string|null}
 */
export function getRj45QuantityError(quantity, gammeId) {
  if (!gammeId) return "Choisissez d'abord la gamme";
  if (!quantity || quantity < 1) return null;

  const max = getMaxRj45Count(gammeId);
  if (quantity > max) {
    return `Ce coffret accepte au maximum ${max} embases RJ45`;
  }
  return null;
}
