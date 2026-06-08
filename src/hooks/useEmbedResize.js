import { useEffect } from "react";
import { isEmbedMode } from "../utils/embedMode.js";
import { getAllowedEmbedOrigins } from "../utils/embedOrigins.js";
import { EMBED_RESIZE_MESSAGE_TYPE } from "../utils/embedMessages.js";

/**
 * @returns {string[]}
 */
function getPostMessageTargets() {
  if (import.meta.env.DEV) {
    return ["*"];
  }

  return getAllowedEmbedOrigins();
}

/**
 * Envoie la hauteur du document au parent Oxatis pour redimensionner l'iframe.
 */
function postEmbedHeight() {
  const height = document.documentElement.scrollHeight;
  const payload = { type: EMBED_RESIZE_MESSAGE_TYPE, height };

  for (const origin of getPostMessageTargets()) {
    window.parent.postMessage(payload, origin);
  }
}

/**
 * Active le redimensionnement automatique de l'iframe parente en mode embed.
 */
export function useEmbedResize() {
  useEffect(() => {
    if (!isEmbedMode()) return undefined;

    postEmbedHeight();

    const resizeObserver = new ResizeObserver(() => {
      postEmbedHeight();
    });

    resizeObserver.observe(document.documentElement);
    resizeObserver.observe(document.body);

    const handleResize = () => postEmbedHeight();
    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);
}
