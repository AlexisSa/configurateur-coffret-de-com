/**
 * Correspondance tarifs Oxatis → codes configurateur.
 * Tarif 2 = S, Tarif 3 = M, Tarif 4 = B, Tarif 5 = A, Tarif 6 = Z (HT).
 */
export const OXATIS_TIER_COLUMNS = {
  S: "Price2VATExcluded",
  M: "Price3VATExcluded",
  B: "Price4VATExcluded",
  A: "Price5VATExcluded",
  Z: "Price6VATExcluded",
};

export const TIER_CODES = ["S", "M", "B", "A", "Z"];

/**
 * SKU configurateur → référence Oxatis quand elles diffèrent.
 */
export const OXATIS_SKU_ALIASES = {
  DTIO4: "DTIO-4",
};
