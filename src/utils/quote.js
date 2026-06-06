import { getConfigurationSummary } from "./bomBuilder.js";
import { formatOrderPricingText } from "./orderPricing.js";
import { formatPriceHT, getPricingDisclaimer, hasPricedLines } from "./pricing.js";
import { normalizeCoffretCount } from "./coffretQuantity.js";

/**
 * Texte de récapitulatif partagé entre le mail de devis et la copie presse-papiers.
 * @param {import('./compatibility.js').ConfigState} state
 * @param {{ societe?: string, clientName?: string, email?: string, telephone?: string, commentaire?: string }} internal
 * @param {import('./bomBuilder.js').BomLine[]} bom
 * @returns {string}
 */
export function buildQuoteText(state, internal, bom, pricingTierCode) {
  const lines = [
    "Demande de devis pour :",
    getConfigurationSummary(state),
    "",
    "Nomenclature :",
    ...bom.map((line) => {
      const price =
        line.lineTotalHT != null
          ? ` — ${formatPriceHT(line.lineTotalHT)} HT`
          : "";
      return `- ${line.quantity}× ${line.sku} — ${line.label}${price}`;
    }),
    "",
  ];

  if (hasPricedLines(bom)) {
    lines.push(
      formatOrderPricingText(bom, normalizeCoffretCount(state.coffretCount))
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

  return lines.join("\n");
}
