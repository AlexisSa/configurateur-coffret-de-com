import { describe, it, expect } from "vitest";
import { getGammeById } from "../utils/catalog.js";
import { buildGammeSku, getGammeLetterCode } from "../utils/gammeSku.js";

describe("gammeSku", () => {
  it("dérive le code lettre (P → T)", () => {
    expect(getGammeLetterCode("Plaque EASY P 300")).toBe("T");
    expect(getGammeLetterCode("P 300")).toBe("T");
    expect(getGammeLetterCode("M 250")).toBe("M");
    expect(getGammeLetterCode("MXL 615")).toBe("MXL");
    expect(getGammeLetterCode("M2L 500")).toBe("M2L");
  });

  it("construit la référence XHG3 depuis le catalogue (sans suffixe variante)", () => {
    const gamme = getGammeById("xh-m-250");
    const materiau = gamme.materiaux[0];
    expect(buildGammeSku(gamme, materiau)).toBe("XHG3M");
    expect(buildGammeSku(getGammeById("xh-p-300"), materiau)).toBe("XHG3T");
    expect(buildGammeSku(getGammeById("xh-xl-625"), materiau)).toBe("XHG3XL");
  });
});
