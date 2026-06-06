import { getConfigurationSummary } from "./bomBuilder.js";
import { buildShareUrl } from "./configCode.js";
import { buildQuoteText } from "./quote.js";
import {
  formatPriceHT,
  formatVatLabel,
  getPricedTotalHT,
  getPricingDisclaimer,
  getTotalTTC,
  hasPricedLines,
} from "./pricing.js";

const MAX_MAILTO_BODY_ENCODED = 1800;
const MAILTO_RECIPIENT = "commercial@xeilom.fr";

/**
 * @param {string} body
 */
function buildShortMailBody(state, internal, bom, pricingTierCode, shareUrl) {
  const lines = [
    "Bonjour,",
    "",
    "Demande de devis pour :",
    getConfigurationSummary(state),
    "",
    "La nomenclature détaillée est disponible via le lien de configuration :",
    shareUrl,
    "",
  ];

  if (hasPricedLines(bom)) {
    const totalHT = getPricedTotalHT(bom);
    lines.push(`Total HT : ${formatPriceHT(totalHT)}`);
    lines.push(
      `Total TTC (${formatVatLabel()}) : ${formatPriceHT(getTotalTTC(totalHT))}`
    );
    const disclaimer = getPricingDisclaimer(pricingTierCode);
    if (disclaimer) lines.push(disclaimer);
    lines.push("");
  }

  if (internal.clientName) lines.push(`Nom complet : ${internal.clientName}`);
  if (internal.societe) lines.push(`Société : ${internal.societe}`);
  if (internal.email) lines.push(`Email : ${internal.email}`);
  if (internal.telephone) lines.push(`Téléphone : ${internal.telephone}`);

  const commentaire = internal.commentaire?.trim();
  if (commentaire) {
    lines.push("", "Commentaire :", commentaire);
  }

  lines.push("", "Cordialement");
  return lines.join("\n");
}

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
  const fullBody = [
    "Bonjour,",
    "",
    buildQuoteText(state, internal, bom, pricingTierCode),
    "",
    "Cordialement",
  ].join("\n");

  let body = fullBody;
  if (encodeURIComponent(fullBody).length > MAX_MAILTO_BODY_ENCODED) {
    body = buildShortMailBody(
      state,
      internal,
      bom,
      pricingTierCode,
      buildShareUrl(state)
    );
  }

  return `mailto:${MAILTO_RECIPIENT}?subject=${subject}&body=${encodeURIComponent(body)}`;
}
