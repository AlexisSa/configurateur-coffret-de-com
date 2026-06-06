import { useEffect, useState } from "react";
import { isEmbedMode } from "../utils/embedMode.js";
import {
  getAllowedEmbedOrigins,
  isAllowedEmbedOrigin,
} from "../utils/embedOrigins.js";
import {
  EMBED_CONTEXT_MESSAGE_TYPE,
  EMBED_REQUEST_CONTEXT_MESSAGE_TYPE,
} from "../utils/embedMessages.js";
import { resolvePricingTierCode } from "../utils/pricingTier.js";

/**
 * @returns {boolean}
 */
function isEmbeddedInParent() {
  try {
    return window.parent !== window;
  } catch {
    return true;
  }
}

/**
 * @returns {string[]}
 */
function getParentPostMessageTargets() {
  if (import.meta.env.DEV) {
    return ["*"];
  }
  return getAllowedEmbedOrigins();
}

/**
 * Demande au parent Oxatis d'envoyer la catégorie client.
 */
function requestPricingContextFromParent() {
  if (!isEmbedMode() && !isEmbeddedInParent()) return;

  const payload = { type: EMBED_REQUEST_CONTEXT_MESSAGE_TYPE };
  for (const origin of getParentPostMessageTargets()) {
    window.parent.postMessage(payload, origin);
  }
}

/**
 * Lit la catégorie tarifaire depuis l'URL (?categoryId= ou ?pricingTier=).
 * @returns {string|null}
 */
function readPricingTierFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("categoryId") ?? params.get("pricingTier");
}

/**
 * @param {MessageEvent} event
 * @returns {string|null}
 */
function readPricingTierFromMessage(event) {
  if (!isAllowedEmbedOrigin(event.origin)) return null;
  if (!event.data || event.data.type !== EMBED_CONTEXT_MESSAGE_TYPE) return null;

  const value = event.data.categoryId ?? event.data.pricingTier ?? null;
  if (value == null) return null;
  return String(value).trim() || null;
}

/**
 * Récupère le tarif client depuis l'URL ou le site parent (postMessage).
 * @returns {{ pricingTierCode: string }}
 */
export function useEmbedContext() {
  const [pricingTierCode, setPricingTierCode] = useState(() =>
    resolvePricingTierCode(readPricingTierFromUrl())
  );

  useEffect(() => {
    const fromUrl = readPricingTierFromUrl();
    if (fromUrl) {
      setPricingTierCode(resolvePricingTierCode(fromUrl));
    }

    const handleMessage = (event) => {
      const value = readPricingTierFromMessage(event);
      if (value) {
        setPricingTierCode(resolvePricingTierCode(value));
      }
    };

    window.addEventListener("message", handleMessage);
    requestPricingContextFromParent();

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return { pricingTierCode };
}

export { EMBED_CONTEXT_MESSAGE_TYPE, EMBED_REQUEST_CONTEXT_MESSAGE_TYPE };
