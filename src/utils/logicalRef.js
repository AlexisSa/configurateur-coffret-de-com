// @ts-check
import { OPTION_IDS } from "./optionIds.js";
import { parseCordonRj45Quantity } from "./cordonRj45.js";
import { parsePriseQuantity } from "./prise.js";
import { parseRj45Quantity } from "./rj45.js";

/**
 * Tokens de nomenclature de la référence logique Xeilom.
 * Centralisés pour éviter les chaînes magiques dans la construction du suffixe.
 */
const REF_SUFFIX = Object.freeze({
  RJ: "RJ",
  PORTE: "P",
  BRASSAGE_EXT: "E",
  SANS_DTI: "SD",
  DTI_RJ45: "DTI",
  DTI_FIBRE_2: "DTIO2",
  DTI_FIBRE_4: "DTIO4",
  PRISE: "PC",
  TV: "TV",
  CORDON_RJ45: "CRJ",
  CORDON_BALUN: "CB",
});

/**
 * Suffixe fixe après « {n}RJ » issu de imageSku (ex. « TVP » pour XHG3XL-8RJTVP).
 * @param {{ imageSku?: string } | null | undefined} gamme
 * @returns {string}
 */
export function getStaticRefSuffixFromImageSku(gamme) {
  const imageSku = gamme?.imageSku;
  if (!imageSku) return "";
  const match = imageSku.match(/^[^-]+-\d+RJ(.*)$/);
  return match?.[1] ?? "";
}

/**
 * Présence d'une porte dans la référence : déduite du `imageSku` (réf. fabricant
 * faisant foi), et non de `attributes.porteMode` qui ne sert qu'au badge UI et
 * diverge pour MX 350 / M2 250. Le token porte est toujours en fin de suffixe.
 * @param {{ imageSku?: string } | null | undefined} gamme
 * @returns {boolean}
 */
function gammeRefIncludesPorte(gamme) {
  return getStaticRefSuffixFromImageSku(gamme).endsWith(REF_SUFFIX.PORTE);
}

/**
 * Token répartiteur TV : « {k}TV » si sélectionné, sinon « ».
 * @param {Record<string, string>} options
 * @returns {string}
 */
export function getTvRefSuffix(options) {
  const tvId = options.tv?.trim();
  if (!tvId) return "";
  const outputs = tvId.match(/^tv-(\d+)$/)?.[1];
  return outputs ? `${outputs}${REF_SUFFIX.TV}` : "";
}

/**
 * Token prises : « {p}PC » (incluses ou en option), sinon « ».
 * @param {{ attributes?: { priseMode?: string, priseCount?: number } } | null | undefined} gamme
 * @param {Record<string, string>} options
 * @returns {string}
 */
export function getPriseRefSuffix(gamme, options) {
  const mode = gamme?.attributes?.priseMode;
  if (mode === "included") {
    const count = gamme?.attributes?.priseCount ?? 0;
    return count > 0 ? `${count}${REF_SUFFIX.PRISE}` : "";
  }
  if (mode === "option") {
    const qty = parsePriseQuantity(options.prise);
    return qty > 0 ? `${qty}${REF_SUFFIX.PRISE}` : "";
  }
  return "";
}

/**
 * Token DTI RJ45 : « DTI » si sélectionné, « SD » sinon (même emplacement dans la réf).
 * @param {Record<string, string>} options
 * @returns {string}
 */
export function getDtiRj45RefSuffix(options) {
  return options.dti_rj45?.trim()
    ? REF_SUFFIX.DTI_RJ45
    : REF_SUFFIX.SANS_DTI;
}

/**
 * Token DTI fibre : « DTIO2 » / « DTIO4 », sinon « ».
 * @param {Record<string, string>} options
 * @returns {string}
 */
export function getDtioRefSuffix(options) {
  const fibreId = options.dti_fibre?.trim();
  if (fibreId === OPTION_IDS.DTI_FIBRE_2) return REF_SUFFIX.DTI_FIBRE_2;
  if (fibreId === OPTION_IDS.DTI_FIBRE_4) return REF_SUFFIX.DTI_FIBRE_4;
  return "";
}

/**
 * Token cordons : « {c}CRJ{b}CB » si cordons RJ45 ou balun > 0 (les deux compteurs
 * sont alors écrits, même à 0), sinon « ».
 * @param {Record<string, string>} options
 * @returns {string}
 */
export function getCordonRefSuffix(options) {
  const cordonRj45 = parseCordonRj45Quantity(options.cordon_rj45);
  const balun = options.cordon_balun?.trim() ? 1 : 0;
  if (cordonRj45 <= 0 && balun <= 0) return "";
  return `${cordonRj45}${REF_SUFFIX.CORDON_RJ45}${balun}${REF_SUFFIX.CORDON_BALUN}`;
}

/**
 * Tokens de la variante (après « {n}RJ »), dans l'ordre figé de la nomenclature.
 * @param {{ imageSku?: string, attributes?: object } | null | undefined} gamme
 * @param {Record<string, string>} options
 * @returns {string[]}
 */
function getVariantTokens(gamme, options) {
  const tokens = [];
  if (gammeRefIncludesPorte(gamme)) tokens.push(REF_SUFFIX.PORTE);
  if (options.brassage === OPTION_IDS.BRASSAGE_EXTERIEUR) {
    tokens.push(REF_SUFFIX.BRASSAGE_EXT);
  }
  tokens.push(getDtiRj45RefSuffix(options));

  const dtio = getDtioRefSuffix(options);
  if (dtio) tokens.push(dtio);

  const prises = getPriseRefSuffix(gamme, options);
  if (prises) tokens.push(prises);

  const tv = getTvRefSuffix(options);
  if (tv) tokens.push(tv);

  const cordons = getCordonRefSuffix(options);
  if (cordons) tokens.push(cordons);

  return tokens;
}

/**
 * Référence logique du coffret configuré (nomenclature Xeilom).
 *
 * Identifiant INTERNE de reconnaissance rapide d'une variante de coffret. Pour
 * une identification complète et réversible, utiliser le lien de partage
 * (`buildShareUrl` / `?config=` dans configCode.js).
 *
 * Grammaire (tokens séparés par « - », sauf le bloc cordons qui colle CRJ + CB) :
 *   XHG3{Gamme}[-{n}RJ[-P][-E][-SD|DTI][-DTIO2|DTIO4][-{p}PC][-{k}TV][-{c}CRJ{b}CB]]
 *     base    = baseSku gamme + suffixe matériau (ex. XHG3XL)
 *     {n}RJ   = nombre d'embases RJ45
 *     P       = porte (selon imageSku fabricant)
 *     E       = brassage extérieur
 *     SD/DTI  = sans DTI RJ45 (« SD ») ou avec DTI RJ45 (« DTI »)
 *     DTIO2/4 = DTI fibre 2 ou 4 prises
 *     {p}PC   = p prises 2P+T (incluses ou en option)
 *     {k}TV   = répartiteur TV à k sorties
 *     {c}CRJ{b}CB = cordons RJ45 (c) et cordons balun (b), uniquement si l'un > 0
 *
 * Un compteur n'apparaît jamais à 0 (sauf dans le bloc cordons, où les deux sont
 * écrits dès que l'un est > 0). Dès le choix de la gamme, les tokens applicables
 * (P, SD, PC incluses…) sont écrits même sans embase RJ45 ; {n}RJ est omis si 0.
 *
 * Ex. XHG3XL-8RJ-P-E-DTI-DTIO2-3PC-4TV-4CRJ2CB
 *
 * @param {import('./catalog.js').ReturnType<typeof import('./catalog.js').getGammeById>} gamme
 * @param {{ skuSuffix?: string } | null | undefined} [materiau]
 * @param {Record<string, string>} [options]
 * @returns {string}
 */
export function buildLogicalCoffretRef(gamme, materiau, options = {}) {
  if (!gamme) return "";

  const base = (gamme.baseSku ?? "") + (materiau?.skuSuffix ?? "");
  const rjQty = parseRj45Quantity(options.rj45);
  const tokens = [];
  if (rjQty > 0) tokens.push(`${rjQty}${REF_SUFFIX.RJ}`);
  tokens.push(...getVariantTokens(gamme, options));

  if (tokens.length === 0) return base;
  return `${base}-${tokens.join("-")}`;
}

/** Légende des tokens pour l'UI. */
export const REF_TOKEN_LEGEND = Object.freeze([
  { token: "RJ", label: "Nombre d'embases RJ45" },
  { token: "P", label: "Porte (selon réf. fabricant)" },
  { token: "E", label: "Brassage extérieur" },
  { token: "SD", label: "Sans DTI RJ45" },
  { token: "DTI", label: "Avec DTI RJ45" },
  { token: "DTIO2", label: "DTI fibre, 2 prises" },
  { token: "DTIO4", label: "DTI fibre, 4 prises" },
  { token: "PC", label: "Prises 2P+T (ex. 3PC)" },
  { token: "TV", label: "Répartiteur TV (ex. 4TV)" },
  { token: "CRJ", label: "Cordons RJ45 (bloc collé avec CB)" },
  { token: "CB", label: "Cordons balun TV" },
]);

/**
 * Découpe une référence logique en caractéristiques lisibles.
 * @param {string} ref
 * @returns {import('./logicalRef.js').ParsedLogicalRef|null}
 */
export function parseLogicalCoffretRef(ref) {
  const trimmed = ref?.trim();
  if (!trimmed?.startsWith("XHG3")) return null;

  const dashIdx = trimmed.indexOf("-");
  const base = dashIdx === -1 ? trimmed : trimmed.slice(0, dashIdx);
  const gamme = base.slice(4);
  if (!gamme) return null;

  /** @type {import('./logicalRef.js').ParsedLogicalRef} */
  const result = {
    gamme,
    rj45: 0,
    porte: false,
    brassageExt: false,
    sansDti: false,
    dtiRj45: false,
    dtiFibre: null,
    prises: 0,
    tv: 0,
    cordonsRj45: 0,
    cordonsBalun: 0,
    raw: trimmed,
  };

  if (dashIdx === -1) return result;

  const tokens = trimmed.slice(dashIdx + 1).split("-");
  for (const token of tokens) {
    const rjMatch = token.match(/^(\d+)RJ$/);
    if (rjMatch) {
      result.rj45 = Number(rjMatch[1]);
      continue;
    }
    if (token === REF_SUFFIX.PORTE) {
      result.porte = true;
      continue;
    }
    if (token === REF_SUFFIX.BRASSAGE_EXT) {
      result.brassageExt = true;
      continue;
    }
    if (token === REF_SUFFIX.SANS_DTI) {
      result.sansDti = true;
      continue;
    }
    if (token === REF_SUFFIX.DTI_RJ45) {
      result.dtiRj45 = true;
      continue;
    }
    if (token === REF_SUFFIX.DTI_FIBRE_2) {
      result.dtiFibre = 2;
      continue;
    }
    if (token === REF_SUFFIX.DTI_FIBRE_4) {
      result.dtiFibre = 4;
      continue;
    }
    const pcMatch = token.match(/^(\d+)PC$/);
    if (pcMatch) {
      result.prises = Number(pcMatch[1]);
      continue;
    }
    const tvMatch = token.match(/^(\d+)TV$/);
    if (tvMatch) {
      result.tv = Number(tvMatch[1]);
      continue;
    }
    const cordMatch = token.match(/^(\d+)CRJ(\d+)CB$/);
    if (cordMatch) {
      result.cordonsRj45 = Number(cordMatch[1]);
      result.cordonsBalun = Number(cordMatch[2]);
      continue;
    }
    return null;
  }

  return result;
}

/**
 * @typedef {Object} ParsedLogicalRef
 * @property {string} gamme
 * @property {number} rj45
 * @property {boolean} porte
 * @property {boolean} brassageExt
 * @property {boolean} sansDti
 * @property {boolean} dtiRj45
 * @property {2|4|null} dtiFibre
 * @property {number} prises
 * @property {number} tv
 * @property {number} cordonsRj45
 * @property {number} cordonsBalun
 * @property {string} raw
 */
