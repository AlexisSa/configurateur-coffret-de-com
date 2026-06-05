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
  it("lit les prix publics HT du catalogue par SKU", () => {
    expect(getUnitPriceHT("XHG3M")).toBe(62);
    expect(getUnitPriceHT("PC45X45")).toBe(4.14);
    expect(getUnitPriceHT("DTIMP4RJ45")).toBe(21.5);
    expect(getUnitPriceHT("KJ6AFSEF1-24")).toBe(99.36);
    expect(getUnitPriceHT("XH-S-CAPOT")).toBe(26.66);
    expect(getUnitPriceHT("XH-SX-CAPOT")).toBe(38.63);
    expect(getUnitPriceHT("XH-ET-LXL")).toBe(13.87);
  });

  it("tarifie capot et étagère dans la nomenclature", () => {
    const bom = buildBom({
      ...state,
      coffretCount: 1,
      gammeId: "xh-s-250",
      options: { ...state.options, capot: "capot-s250", prise: "" },
    });
    expect(bom.find((l) => l.sku === "XH-S-CAPOT")?.lineTotalHT).toBe(26.66);

    const bomL = buildBom({
      ...state,
      coffretCount: 1,
      gammeId: "xh-l-500",
      options: { ...state.options, etagere_box: "etagere-box", capot: "" },
    });
    expect(bomL.find((l) => l.sku === "XH-ET-LXL")?.lineTotalHT).toBe(13.87);
  });

  it("applique le prix provisoire du châssis (catalogue gammes)", () => {
    const bom = buildBom(state);
    const base = bom.find((l) => l.sku === "XHG3M");
    expect(base?.unitPriceHT).toBe(62);
    expect(base?.lineTotalHT).toBe(124);
  });

  it("calcule les totaux de ligne et le total général", () => {
    const bom = buildBom(state);
    const dti = bom.find((l) => l.sku === "DTIMP4RJ45");
    expect(dti?.unitPriceHT).toBe(21.5);
    expect(dti?.lineTotalHT).toBe(43);

    const prise = bom.find((l) => l.sku === "PC45X45");
    expect(prise?.lineTotalHT).toBe(8.28);

    const rj45 = bom.find((l) => l.sku === "KJ6AFSEF1");
    expect(rj45?.lineTotalHT).toBe(33.12);

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
