import { describe, it, expect } from "vitest";
import { getGammeById } from "../utils/catalog.js";
import {
  getChassisPricingSku,
  getChassisSkuSuffixFromOptions,
} from "../utils/gammeSku.js";

describe("gammeSku", () => {
  it("construit le SKU de tarification châssis depuis le catalogue", () => {
    const gamme = getGammeById("xh-m-250");
    const materiau = gamme.materiaux[0];
    expect(getChassisPricingSku(gamme, materiau)).toBe("XHG3M");
    expect(getChassisPricingSku(getGammeById("xh-p-300"), materiau)).toBe("XHG3T");
    expect(getChassisPricingSku(getGammeById("xh-xl-625"), materiau)).toBe(
      "XHG3XL"
    );
  });

  it("ajoute le suffixe -E au SKU tarifaire pour le brassage extérieur", () => {
    const gamme = getGammeById("xh-m-250");
    const materiau = gamme.materiaux[0];
    const options = { brassage: "brassage-exterieur" };
    expect(getChassisSkuSuffixFromOptions(options)).toBe("-E");
    expect(getChassisPricingSku(gamme, materiau, options)).toBe("XHG3M-E");
    expect(getChassisPricingSku(getGammeById("xh-ml-500"), materiau, options)).toBe(
      "XHG3ML-E"
    );
    expect(getChassisPricingSku(getGammeById("xh-mxl-615"), materiau, options)).toBe(
      "XHG3MXL-E"
    );
  });
});
