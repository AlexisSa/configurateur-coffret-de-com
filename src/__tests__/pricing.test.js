import { describe, it, expect } from "vitest";
import { buildBom } from "../utils/bomBuilder.js";
import {
  applyPricingToLine,
  formatPriceHT,
  getPricedTotalHT,
  getUnitPriceHT,
} from "../utils/pricing.js";

const state = {
  gammeId: "xh-m-250",
  materiau: "grade3",
  coffretCount: 2,
  options: {
    dti_rj45: "dti-rj45-4precable",
    dti_fibre: "",
    rj45: "4",
    tv: "tv-4",
    terre: "",
    prise: "1",
    etagere_box: "",
    capot: "",
    porte: "",
  },
};

describe("pricing", () => {
  it("renvoie un prix HT positif pour les SKU connus", () => {
    for (const sku of ["XHG3M", "PC45X45", "DTIMP4RJ45", "XH-S-CAPOT"]) {
      expect(getUnitPriceHT(sku)).toBeGreaterThan(0);
    }
  });

  it("tarifie les lignes selon le prix unitaire de la matrice", () => {
    const bom = buildBom({
      ...state,
      coffretCount: 1,
      gammeId: "xh-s-250",
      options: { ...state.options, capot: "capot-s250", prise: "" },
    });
    const capot = bom.find((l) => l.sku === "XH-S-CAPOT");
    expect(capot?.lineTotalHT).toBe(getUnitPriceHT("XH-S-CAPOT"));

    const bomL = buildBom({
      ...state,
      coffretCount: 1,
      gammeId: "xh-l-500",
      options: { ...state.options, etagere_box: "etagere-box", capot: "" },
    });
    const etagere = bomL.find((l) => l.sku === "XH-ET-LXL");
    expect(etagere?.lineTotalHT).toBe(getUnitPriceHT("XH-ET-LXL"));
  });

  it("multiplie le prix unitaire du châssis par le nombre de coffrets", () => {
    const bom = buildBom(state);
    const base = bom.find((l) => l.sku === "XHG3M");
    const unit = getUnitPriceHT("XHG3M");
    expect(base?.unitPriceHT).toBe(unit);
    expect(base?.lineTotalHT).toBe(
      Math.round(unit * state.coffretCount * 100) / 100
    );
  });

  it("calcule chaque ligne comme prix unitaire × quantité", () => {
    const bom = buildBom(state);
    for (const line of bom) {
      if (line.unitPriceHT == null) continue;
      const expected = Math.round(line.unitPriceHT * line.quantity * 100) / 100;
      expect(line.lineTotalHT).toBe(expected);
    }

    expect(getPricedTotalHT(bom)).toBeGreaterThan(0);
  });

  it("formate les montants en euros", () => {
    expect(formatPriceHT(4.14)).toContain("4,14");
    expect(formatPriceHT(null)).toBe("—");
  });

  it("laisse les lignes sans prix inchangées", () => {
    const line = applyPricingToLine({
      sku: "INCLUS",
      label: "Test",
      quantity: 1,
      type: "materiau",
    });
    expect(line.lineTotalHT).toBeNull();
  });
});
