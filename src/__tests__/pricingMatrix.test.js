import { describe, it, expect } from "vitest";
import { getSkuTierPriceHT } from "../utils/pricingMatrix.js";
import { getUnitPriceHT } from "../utils/pricing.js";

describe("pricingMatrix", () => {
  it("lit le tarif S par SKU depuis la matrice", () => {
    expect(getSkuTierPriceHT("XHG3M", "S")).toBe(95);
    expect(getSkuTierPriceHT("DTIMP4RJ45", "S")).toBe(21.5);
  });

  it("calcule le lot x24 depuis le tarif unitaire de la matrice", () => {
    expect(getSkuTierPriceHT("KJ6AFSEF1-24", "S")).toBe(99.36);
  });

  it("n'affiche pas de prix pro tant que le tarif n'est pas renseigné", () => {
    expect(getSkuTierPriceHT("XHG3M", "Z")).toBeNull();
  });

  it("expose getUnitPriceHT via la matrice", () => {
    expect(getUnitPriceHT("PC45X45", "S")).toBe(4.14);
  });
});
