/**
 * Détecte le mode intégration iframe (paramètre ?embed=1).
 * @returns {boolean}
 */
export function isEmbedMode() {
  return new URLSearchParams(window.location.search).get("embed") === "1";
}
