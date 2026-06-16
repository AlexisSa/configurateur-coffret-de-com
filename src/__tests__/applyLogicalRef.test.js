import { describe, expect, it } from "vitest";
import { OPTION_IDS } from "../utils/optionIds.js";
import {
  buildOptionsFromParsedRef,
  configDraftFromLogicalRef,
  findGammeIdByRefCode,
} from "../utils/applyLogicalRef.js";
import { parseLogicalCoffretRef } from "../utils/logicalRef.js";

describe("findGammeIdByRefCode", () => {
  it("résout M vers xh-m-250", () => {
    expect(findGammeIdByRefCode("M")).toBe("xh-m-250");
  });

  it("retourne null pour une gamme inconnue", () => {
    expect(findGammeIdByRefCode("ZZZ")).toBeNull();
  });
});

describe("buildOptionsFromParsedRef", () => {
  it("mappe les tokens vers les options du configurateur", () => {
    const parsed = parseLogicalCoffretRef("XHG3M-4RJ-E-DTI-2TV-2CRJ1CB");
    expect(parsed).not.toBeNull();

    const options = buildOptionsFromParsedRef(parsed, "xh-m-250");
    expect(options.rj45).toBe("4");
    expect(options.brassage).toBe(OPTION_IDS.BRASSAGE_EXTERIEUR);
    expect(options.dti_rj45).toBe(OPTION_IDS.DTI_RJ45_4PRECABLE);
    expect(options.tv).toBe("tv-2");
    expect(options.cordon_rj45).toBe("2");
    expect(options.cordon_balun).toBe("cordon-balun-rj45-f");
  });
});

describe("configDraftFromLogicalRef", () => {
  it("produit un brouillon de configuration valide", () => {
    const { draft, error } = configDraftFromLogicalRef("XHG3M-4RJ-SD-4TV");
    expect(error).toBeUndefined();
    expect(draft).toMatchObject({
      gammeId: "xh-m-250",
      materiau: "grade3",
      coffretCount: 1,
    });
    expect(draft?.options.rj45).toBe("4");
    expect(draft?.options.tv).toBe("tv-4");
  });

  it("signale une référence invalide", () => {
    const { draft, error } = configDraftFromLogicalRef("INVALID");
    expect(draft).toBeUndefined();
    expect(error).toMatch(/non reconnue/i);
  });
});
