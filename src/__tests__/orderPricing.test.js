import { describe, it, expect } from "vitest";
import { buildBom } from "../utils/bomBuilder.js";
import {
  formatOrderPricingText,
  getOrderPricingSummary,
} from "../utils/orderPricing.js";
import { getUnitPriceHT } from "../utils/pricing.js";

const state = {
  gammeId: "xh-m-250",
  materiau: "grade3",
  coffretCount: 3,
  options: {
    dti_rj45: "dti-rj45-4precable",
    dti_fibre: "",
    rj45: "4",
    cordon_rj45: "",
    tv: "tv-4",
    cordon_balun: "",
    rehausse: "",
    prise: "",
    etagere_box: "",
    capot: "",
    porte: "",
    brassage: "brassage-interieur",
  },
};

describe("orderPricing", () => {
  it("conserve la nomenclature à l'unité et calcule le total commande", () => {
    const bom = buildBom(state);
    const base = bom.find((l) => l.sku === "XHG3M");
    const unit = getUnitPriceHT("XHG3M");

    expect(base?.quantity).toBe(1);
    expect(base?.lineTotalHT).toBe(unit);

    const summary = getOrderPricingSummary(bom, 3);
    expect(summary.unitTotalHT).toBeGreaterThan(0);
    expect(summary.orderTotalHT).toBe(
      Math.round(summary.unitTotalHT * 3 * 100) / 100
    );
  });

  it("formate le prix unitaire et le total pour plusieurs coffrets", () => {
    const bom = buildBom(state);
    const text = formatOrderPricingText(bom, 3);

    expect(text).toContain("Prix unitaire HT");
    expect(text).toContain("Total HT (3 coffrets)");
    expect(text).toContain("TTC");
  });
});
