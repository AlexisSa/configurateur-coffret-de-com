import { useEffect, useState } from "react";
import { isAllowedEmbedOrigin } from "../utils/embedOrigins.js";
import { resolvePricingTierCode } from "../utils/pricingTier.js";

export const EMBED_CONTEXT_MESSAGE_TYPE = "coffret-context";

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

  return event.data.categoryId ?? event.data.pricingTier ?? null;
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
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return { pricingTierCode };
}
