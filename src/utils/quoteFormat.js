import { getOrderPricingLines } from "./orderPricing.js";
import { formatPriceHT, getPricingDisclaimer, hasPricedLines } from "./pricing.js";
import { normalizeCoffretCount } from "./coffretQuantity.js";

/**
 * @param {string} title
 * @param {string[]} lines
 * @returns {string[]}
 */
export function formatQuoteSection(title, lines) {
  const content = lines.filter((line) => line.trim().length > 0);
  if (content.length === 0) return [];

  return ["", `--- ${title.toUpperCase()} ---`, ...content];
}

/**
 * @param {{ clientName?: string, societe?: string, email?: string, telephone?: string, commentaire?: string }} internal
 * @returns {string[]}
 */
export function buildClientSectionLines(internal) {
  const lines = [];
  if (internal.clientName?.trim()) lines.push(`Nom : ${internal.clientName.trim()}`);
  if (internal.societe?.trim()) lines.push(`Société : ${internal.societe.trim()}`);
  if (internal.email?.trim()) lines.push(`Email : ${internal.email.trim()}`);
  if (internal.telephone?.trim()) {
    lines.push(`Téléphone : ${internal.telephone.trim()}`);
  }
  return lines;
}

/**
 * @param {import('./compatibility.js').ConfigState} state
 * @returns {string[]}
 */
export function buildConfigurationSectionLines(state) {
  const coffretCount = normalizeCoffretCount(state.coffretCount);
  return [`Nombre de coffrets : ${coffretCount}`];
}

/**
 * @param {import('./bomBuilder.js').BomLine[]} bom
 * @returns {string[]}
 */
export function buildBomSectionLines(bom) {
  return bom.map((line) => {
    const price =
      line.lineTotalHT != null
        ? ` — ${formatPriceHT(line.lineTotalHT)} HT`
        : "";
    return `  • ${line.quantity}× ${line.sku} — ${line.label}${price}`;
  });
}

/**
 * @param {import('./bomBuilder.js').BomLine[]} bom
 * @param {number} coffretCount
 * @param {string} pricingTierCode
 * @returns {string[]}
 */
export function buildPricingSectionLines(bom, coffretCount, pricingTierCode) {
  if (!hasPricedLines(bom)) return [];

  const lines = getOrderPricingLines(bom, coffretCount).map(
    (line) => `  ${line.label} : ${formatPriceHT(line.amount)}`
  );

  const disclaimer = getPricingDisclaimer(pricingTierCode);
  if (disclaimer) lines.push("", `  ${disclaimer}`);

  return lines;
}

/**
 * @param {string} [commentaire]
 * @returns {string[]}
 */
export function buildCommentSectionLines(commentaire) {
  const text = commentaire?.trim();
  if (!text) return [];
  return text.split("\n").map((line) => `  ${line}`);
}

/**
 * @param {{
 *   state: import('./compatibility.js').ConfigState,
 *   internal: { clientName?: string, societe?: string, email?: string, telephone?: string, commentaire?: string },
 *   bom: import('./bomBuilder.js').BomLine[],
 *   pricingTierCode: string,
 * }} params
 * @returns {string}
 */
export function buildStructuredQuoteBody({ state, internal, bom, pricingTierCode }) {
  const coffretCount = normalizeCoffretCount(state.coffretCount);
  const sections = [
    ...formatQuoteSection("Coordonnées client", buildClientSectionLines(internal)),
    ...formatQuoteSection(
      "Configuration demandée",
      buildConfigurationSectionLines(state)
    ),
    ...formatQuoteSection(
      "Nomenclature (par coffret)",
      buildBomSectionLines(bom)
    ),
    ...formatQuoteSection(
      "Estimation indicative",
      buildPricingSectionLines(bom, coffretCount, pricingTierCode)
    ),
    ...formatQuoteSection(
      "Commentaire client",
      buildCommentSectionLines(internal.commentaire)
    ),
  ];

  return sections.join("\n").trim();
}
