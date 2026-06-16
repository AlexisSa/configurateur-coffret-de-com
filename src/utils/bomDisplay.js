/**
 * Référence logique complète du coffret (hors liste composants).
 * @param {import('./bomBuilder.js').BomLine[]} bom
 * @returns {string|null}
 */
export function getConfiguredCoffretRef(bom) {
  const base = bom.find((line) => line.type === "base");
  return base?.configRef || null;
}

/**
 * Libellé court pour l’affichage nomenclature (colonne unique réf. + désignation).
 * @param {import('./bomBuilder.js').BomLine} line
 * @returns {string}
 */
export function getBomShortDesignation(line) {
  const bySku = SHORT_LABEL_BY_SKU[line.sku];
  if (bySku) return bySku;

  if (line.sku === "INCLUS") {
    if (line.label.startsWith("Capot")) return "Capot (fourni)";
    if (line.label.startsWith("Porte")) return "Porte (fournie)";
    const priseMatch = line.label.match(/(\d+)/);
    if (line.label.startsWith("Prises") && priseMatch) {
      return `Prises 2P+T ×${priseMatch[1]} (incluses)`;
    }
    return line.label.split(" — ")[0] ?? line.label;
  }

  if (line.type === "base") {
    const [gamme, materiau] = line.label.split(" — ");
    if (materiau) {
      const matShort = materiau.replace(/^Grade 3 TV$/, "G3 TV");
      return `${gamme} · ${matShort}`;
    }
    return line.label;
  }

  return shortenOptionLabel(line.label);
}

/** @type {Record<string, string>} */
const SHORT_LABEL_BY_SKU = {
  DTIMP4RJ45: "DTI RJ45, 4 ports",
  DTIO2: "DTI fibre, 2 prises",
  DTIO4: "DTI fibre, 4 prises",
  "SPLITF-2": "Répart. TV, 2 sorties",
  "SPLITF-3": "Répart. TV, 3 sorties",
  "SPLITF-4": "Répart. TV, 4 sorties",
  "SPLITF-6": "Répart. TV, 6 sorties",
  "SPLITF-8": "Répart. TV, 8 sorties",
  "BMT-PRD": "Bornier terre",
  PC45X45: "Prise 2P+T",
  KJ6AFSEF1: "Embase RJ45 Cat.6A",
  "KJ6AFSEF1-24": "Lot 24 embases RJ45",
  "CR6ASSTPOH0.5GS": "Cordon RJ45 0,50 m",
  "CR503S78-0.5": "Cordon balun RJ45/F 0,50 m",
  "XH-ET-LXL": "Étagère coffret",
  "XH-S-CAPOT": "Capot S 250",
  "XH-SX-CAPOT": "Capot SX 350",
  "XH-S-REH": "Rehausse S 250",
  "XH-SX-REH": "Rehausse SX 350",
  "XH-L-PORTE-HQ": "Porte L 500×250",
};

/**
 * @param {string} label
 * @returns {string}
 */
function shortenOptionLabel(label) {
  return label
    .replace(/\s*\([^)]*\)\s*$/, "")
    .replace(/^Lot de 24 — /, "Lot ×24 ")
    .replace(/^Embase RJ45 femelle Cat\. 6A S\/FTP avec volet$/, "Embase RJ45 Cat.6A")
    .replace(/^Répartiteur TV /, "Répart. TV, ")
    .replace(/^Bornier mise à la terre rail DIN$/, "Bornier terre")
    .replace(/^Prise 2P\+T modulaire$/, "Prise 2P+T")
    .replace(/^Étagère à fixer dans les coffrets$/, "Étagère coffret")
    .trim();
}
