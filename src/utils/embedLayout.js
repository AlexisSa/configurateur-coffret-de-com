/** Même seuil que layout.css (sidebar sticky / 2 colonnes). */
export const DESKTOP_EMBED_MEDIA_QUERY = "(min-width: 961px)";

const EMBED_SIDEBAR_TOP_PX = 16;
const EMBED_SIDEBAR_BOTTOM_GAP_PX = 16;

/**
 * Hauteur à communiquer au parent : taille réelle du document (scroll fluide page Oxatis).
 */
export function getEmbedReportedHeight() {
  if (typeof document === "undefined") return 0;
  return document.documentElement.scrollHeight;
}

/**
 * Épingle la colonne droite au viewport visible de l'iframe (scroll parent).
 * @param {HTMLElement} sidebar
 * @param {HTMLElement} stack
 */
export function syncEmbedSidebarPinned(sidebar, stack) {
  const mq = window.matchMedia(DESKTOP_EMBED_MEDIA_QUERY);

  if (!mq.matches) {
    sidebar.classList.remove("sidebar-column--pinned");
    sidebar.style.minHeight = "";
    stack.style.cssText = "";
    return;
  }

  const rect = sidebar.getBoundingClientRect();
  const maxHeight = Math.max(
    200,
    window.innerHeight - EMBED_SIDEBAR_TOP_PX - EMBED_SIDEBAR_BOTTOM_GAP_PX
  );

  sidebar.classList.add("sidebar-column--pinned");
  stack.style.position = "fixed";
  stack.style.top = `${EMBED_SIDEBAR_TOP_PX}px`;
  stack.style.left = `${rect.left}px`;
  stack.style.width = `${rect.width}px`;
  stack.style.maxHeight = `${maxHeight}px`;
  stack.style.zIndex = "5";
  sidebar.style.minHeight = `${stack.scrollHeight}px`;
}
