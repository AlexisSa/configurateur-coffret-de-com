import { describe, it, expect } from "vitest";
import {
  getSkuTierPriceHT,
  getSkuTierPrices,
} from "../utils/pricingMatrix.js";
import { getUnitPriceHT } from "../utils/pricing.js";
import { catalog } from "../utils/catalog.js";

const LOT_24_SIZE = 24;

describe("pricingMatrix", () => {
  it("renvoie le prix du tarif demandé tel quel dans la matrice", () => {
    const tiers = getSkuTierPrices("XHG3M");
    expect(tiers).toBeDefined();
    expect(getSkuTierPriceHT("XHG3M", "S")).toBe(tiers.S);
  });

  it("calcule le lot x24 à partir du tarif unitaire de l'embase", () => {
    const embase = catalog.components.embaseRj45;
    const unit = getSkuTierPrices(embase.sku)?.S;
    expect(typeof unit).toBe("number");

    const expected = Math.round(unit * LOT_24_SIZE * 100) / 100;
    expect(getSkuTierPriceHT(embase.skuLot24, "S")).toBe(expected);
  });

  it("renvoie null pour un SKU inconnu", () => {
    expect(getSkuTierPriceHT("SKU-INCONNU", "Z")).toBeNull();
  });

  it("expose un prix S pour chaque châssis du catalogue", () => {
    for (const gamme of catalog.gammes) {
      expect(getSkuTierPriceHT(gamme.baseSku, "S")).not.toBeNull();
    }
  });

  it("reflète fidèlement chaque tarif d'un SKU (nombre ou null)", () => {
    const sku = "XH-L-PORTE-HQ";
    const tiers = getSkuTierPrices(sku);
    expect(tiers).toBeDefined();

    for (const [code, price] of Object.entries(tiers)) {
      const expected = typeof price === "number" ? price : null;
      expect(getSkuTierPriceHT(sku, code)).toBe(expected);
    }
  });

  it("aligne getUnitPriceHT sur la matrice", () => {
    expect(getUnitPriceHT("XHG3M", "S")).toBe(getSkuTierPriceHT("XHG3M", "S"));
  });
});
