// @ts-check
import { catalog, getGammeById } from "./catalog.js";
import {
  DEFAULT_MATERIAU,
  defaultOptionsForGamme,
} from "./configSanitizer.js";
import { parseLogicalCoffretRef } from "./logicalRef.js";
import { OPTION_IDS } from "./optionIds.js";

const CORDON_BALUN_OPTION_ID = "cordon-balun-rj45-f";

/**
 * @param {string} refGammeCode Code après « XHG3 » (ex. M, XL, M2L).
 * @returns {string|null}
 */
export function findGammeIdByRefCode(refGammeCode) {
  const baseSku = `XHG3${refGammeCode}`;
  return catalog.gammes.find((g) => g.baseSku === baseSku)?.id ?? null;
}

/**
 * @param {import("./logicalRef.js").ParsedLogicalRef} parsed
 * @param {string} gammeId
 * @returns {Record<string, string>}
 */
export function buildOptionsFromParsedRef(parsed, gammeId) {
  const options = { ...defaultOptionsForGamme(gammeId) };
  const gamme = getGammeById(gammeId);

  if (parsed.rj45 > 0) {
    options.rj45 = String(parsed.rj45);
  }

  if (parsed.brassageExt) {
    options.brassage = OPTION_IDS.BRASSAGE_EXTERIEUR;
  }

  options.dti_rj45 = parsed.dtiRj45 ? OPTION_IDS.DTI_RJ45_4PRECABLE : "";
  options.dti_fibre =
    parsed.dtiFibre === 2
      ? OPTION_IDS.DTI_FIBRE_2
      : parsed.dtiFibre === 4
        ? OPTION_IDS.DTI_FIBRE_4
        : "";

  if (parsed.prises > 0 && gamme?.attributes?.priseMode === "option") {
    options.prise = String(parsed.prises);
  }

  if (parsed.tv > 0) {
    options.tv = `tv-${parsed.tv}`;
  }

  if (parsed.cordonsRj45 > 0) {
    options.cordon_rj45 = String(parsed.cordonsRj45);
  }
  options.cordon_balun =
    parsed.cordonsBalun > 0 ? CORDON_BALUN_OPTION_ID : "";

  return options;
}

/**
 * Construit un brouillon de configuration à partir d'une référence logique.
 * @param {string} ref
 * @returns {{ draft?: import('./compatibility.js').ConfigState, error?: string }}
 */
export function configDraftFromLogicalRef(ref) {
  const parsed = parseLogicalCoffretRef(ref);
  if (!parsed) {
    return { error: "Référence non reconnue. Vérifiez le format (ex. XHG3M-4RJ-SD-4TV)." };
  }

  const gammeId = findGammeIdByRefCode(parsed.gamme);
  if (!gammeId) {
    return { error: `Gamme « ${parsed.gamme} » introuvable dans le catalogue.` };
  }

  return {
    draft: {
      gammeId,
      materiau: DEFAULT_MATERIAU,
      coffretCount: 1,
      options: buildOptionsFromParsedRef(parsed, gammeId),
    },
  };
}
