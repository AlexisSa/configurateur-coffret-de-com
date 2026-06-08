/** Même seuil que layout.css (sidebar sticky / 2 colonnes). */
export const DESKTOP_EMBED_MEDIA_QUERY = "(min-width: 961px)";

/**
 * Hauteur à communiquer au parent pour dimensionner l'iframe.
 * En desktop embed : hauteur viewport → scroll interne, sidebar sticky.
 * En mobile embed : hauteur document → scroll parent (colonne unique).
 */
export function getEmbedReportedHeight() {
  if (typeof window === "undefined") return 0;

  if (window.matchMedia(DESKTOP_EMBED_MEDIA_QUERY).matches) {
    return window.innerHeight;
  }

  return document.documentElement.scrollHeight;
}

/**
 * @param {boolean} useViewportScroll
 */
export function syncEmbedViewportScrollClass(useViewportScroll) {
  document.documentElement.classList.toggle("embed-mode", useViewportScroll);
}

export function disableEmbedViewportScroll() {
  document.documentElement.classList.remove("embed-mode");
}
