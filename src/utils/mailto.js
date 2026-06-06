import { buildStructuredQuoteBody } from "./quoteFormat.js";

const MAILTO_RECIPIENT = "commercial@xeilom.fr";

/**
 * @param {{
 *   state: import('./compatibility.js').ConfigState,
 *   internal: { clientName?: string, societe?: string, email?: string, telephone?: string, commentaire?: string },
 *   bom: import('./bomBuilder.js').BomLine[],
 *   pricingTierCode: string,
 *   configCode: string,
 * }} params
 */
export function buildMailtoLink({ state, internal, bom, pricingTierCode, configCode }) {
  const subject = encodeURIComponent(`Devis coffret — ${configCode}`);
  const body = [
    "Bonjour,",
    "",
    buildStructuredQuoteBody({
      state,
      internal,
      bom,
      pricingTierCode,
    }),
    "",
    "Cordialement",
  ].join("\n");

  return `mailto:${MAILTO_RECIPIENT}?subject=${subject}&body=${encodeURIComponent(body)}`;
}
