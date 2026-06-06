import { describe, it, expect } from "vitest";
import { buildBom } from "../utils/bomBuilder.js";
import {
  normalizePriseValue,
  parsePriseQuantity,
  MAX_PRISE_COUNT,
} from "../utils/prise.js";

const baseState = {
  gammeId: "xh-m-250",
  materiau: "grade3",
  coffretCount: 1,
  options: {
    dti_rj45: "",
    dti_fibre: "",
    rj45: "",
    tv: "",
    terre: "",
    prise: "",
    etagere_box: "",
    capot: "",
    porte: "",
    brassage: "",
  },
};

describe("prise", () => {
  it("parse et normalise la quantité (legacy prise-2pt = 1)", () => {
    expect(parsePriseQuantity("prise-2pt")).toBe(1);
    expect(parsePriseQuantity("2")).toBe(2);
    expect(normalizePriseValue("prise-2pt")).toBe("1");
    expect(normalizePriseValue("5")).toBe(String(MAX_PRISE_COUNT));
  });

  it("ajoute 1 ou 2 prises à la nomenclature", () => {
    const bom1 = buildBom({ ...baseState, options: { ...baseState.options, prise: "1" } });
    expect(bom1.find((l) => l.sku === "PC45X45")?.quantity).toBe(1);

    const bom2 = buildBom({ ...baseState, options: { ...baseState.options, prise: "2" } });
    expect(bom2.find((l) => l.sku === "PC45X45")?.quantity).toBe(2);
  });

  it("n’ajoute pas de prise si groupe masqué (prises incluses)", () => {
    const bom = buildBom({
      ...baseState,
      gammeId: "xh-ml-500",
      options: { ...baseState.options, prise: "2" },
    });
    expect(bom.find((l) => l.sku === "PC45X45")).toBeUndefined();
    expect(bom.some((l) => l.sku === "INCLUS")).toBe(false);
  });
});
