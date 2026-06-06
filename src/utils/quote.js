import { buildStructuredQuoteBody } from "./quoteFormat.js";

/**
 * Texte de récapitulatif partagé entre le mail de devis et la copie presse-papiers.
 * @param {import('./compatibility.js').ConfigState} state
 * @param {{ societe?: string, clientName?: string, email?: string, telephone?: string, commentaire?: string }} internal
 * @param {import('./bomBuilder.js').BomLine[]} bom
 * @returns {string}
 */
export function buildQuoteText(state, internal, bom, pricingTierCode) {
  return buildStructuredQuoteBody({
    state,
    internal,
    bom,
    pricingTierCode,
    mode: "full",
  });
}
