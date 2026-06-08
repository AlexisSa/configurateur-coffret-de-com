import { useEffect } from "react";
import { isEmbedMode } from "../utils/embedMode.js";
import {
  DESKTOP_EMBED_MEDIA_QUERY,
  syncEmbedSidebarPinned,
} from "../utils/embedLayout.js";

/**
 * En iframe desktop, épingle la nomenclature au viewport visible
 * tout en gardant l'iframe en pleine hauteur (scroll page parent).
 *
 * @param {import('react').RefObject<HTMLElement|null>} sidebarRef
 * @param {import('react').RefObject<HTMLElement|null>} stackRef
 */
export function useEmbedSidebarPinned(sidebarRef, stackRef) {
  useEffect(() => {
    if (!isEmbedMode()) return undefined;

    const sidebar = sidebarRef.current;
    const stack = stackRef.current;
    if (!sidebar || !stack) return undefined;

    const sync = () => {
      if (sidebarRef.current && stackRef.current) {
        syncEmbedSidebarPinned(sidebarRef.current, stackRef.current);
      }
    };

    sync();

    const resizeObserver = new ResizeObserver(sync);
    resizeObserver.observe(stack);
    resizeObserver.observe(sidebar);

    const layout = document.querySelector(".layout");
    if (layout) resizeObserver.observe(layout);

    window.addEventListener("resize", sync);

    const desktopMq = window.matchMedia(DESKTOP_EMBED_MEDIA_QUERY);
    desktopMq.addEventListener("change", sync);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", sync);
      desktopMq.removeEventListener("change", sync);
      sidebar.classList.remove("sidebar-column--pinned");
      sidebar.style.minHeight = "";
      stack.style.cssText = "";
    };
  }, [sidebarRef, stackRef]);
}
