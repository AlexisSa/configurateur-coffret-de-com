import { describe, it, expect } from "vitest";
import {
  getDefaultPricingTierCode,
  resolvePricingTierCode,
} from "../utils/pricingTier.js";

describe("pricingTier", () => {
  it("utilise S comme tarif par défaut", () => {
    expect(getDefaultPricingTierCode()).toBe("S");
    expect(resolvePricingTierCode(undefined)).toBe("S");
    expect(resolvePricingTierCode("")).toBe("S");
  });

  it("résout les IDs Oxatis vers les codes tarif", () => {
    expect(resolvePricingTierCode("3394217")).toBe("S");
    expect(resolvePricingTierCode(3394219)).toBe("Z");
    expect(resolvePricingTierCode("3394220")).toBe("M");
    expect(resolvePricingTierCode("3394218")).toBe("B");
    expect(resolvePricingTierCode("3394154")).toBe("A");
    expect(resolvePricingTierCode("3394219")).toBe("Z");
  });

  it("accepte aussi le code tarif directement", () => {
    expect(resolvePricingTierCode("z")).toBe("Z");
    expect(resolvePricingTierCode("A")).toBe("A");
  });

  it("retombe sur S pour une catégorie inconnue", () => {
    expect(resolvePricingTierCode("9999999")).toBe("S");
  });
});
