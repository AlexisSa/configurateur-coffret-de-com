/**
 * Dimensions affichées comme sur le site (H × L).
 * @param {import('./catalog.js').catalog.gammes[0]} gamme
 * @returns {string}
 */
export function formatGammeDimensions(gamme) {
  const { largeurMm, hauteurMm } = gamme.attributes ?? {};
  if (!largeurMm) return gamme.dimensions ?? "";

  if (gamme.id === "xh-p-300") {
    return `H : 250 à 300 mm × L : ${largeurMm} mm`;
  }

  if (hauteurMm) {
    return `H : ${hauteurMm} mm × L : ${largeurMm} mm`;
  }

  return gamme.dimensions ?? "";
}

/**
 * Sous-titre optionnel sous le libellé (ex. « avec porte »).
 * @param {import('./catalog.js').catalog.gammes[0]} gamme
 * @returns {string|null}
 */
export function getGammeSelectorSubtitle(gamme) {
  if (gamme.attributes?.porteMode === "included") {
    return "avec porte";
  }
  return null;
}
