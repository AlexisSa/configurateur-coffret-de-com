import { getConfigurationSummary } from "./bomBuilder.js";
import {
  formatPriceHT,
  formatVatLabel,
  getPricedTotalHT,
  getPricingDisclaimer,
  getTotalTTC,
  hasPricedLines,
} from "./pricing.js";

/**
 * Texte de récapitulatif partagé entre le mail de devis et la copie presse-papiers.
 * @param {import('./compatibility.js').ConfigState} state
 * @param {{ societe?: string, clientName?: string, email?: string, telephone?: string }} internal
 * @param {import('./bomBuilder.js').BomLine[]} bom
 * @returns {string}
 */
export function buildQuoteText(state, internal, bom) {
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
    const totalHT = getPricedTotalHT(bom);
    lines.push(`Total HT : ${formatPriceHT(totalHT)}`);
    lines.push(
      `Total TTC (${formatVatLabel()}) : ${formatPriceHT(getTotalTTC(totalHT))}`
    );
    const disclaimer = getPricingDisclaimer();
    if (disclaimer) lines.push(disclaimer);
    lines.push("");
  }

  if (internal.clientName) lines.push(`Nom complet : ${internal.clientName}`);
  if (internal.societe) lines.push(`Société : ${internal.societe}`);
  if (internal.email) lines.push(`Email : ${internal.email}`);
  if (internal.telephone) lines.push(`Téléphone : ${internal.telephone}`);

  return lines.join("\n");
}
