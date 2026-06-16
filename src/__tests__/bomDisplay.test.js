import { describe, expect, it } from "vitest";
import { getBomShortDesignation, getConfiguredCoffretRef } from "../utils/bomDisplay.js";

describe("getConfiguredCoffretRef", () => {
  it("renvoie la réf. du châssis ou null", () => {
    expect(
      getConfiguredCoffretRef([
        { sku: "XHG3M", type: "base" },
      ])
    ).toBeNull();

    expect(
      getConfiguredCoffretRef([
        {
          sku: "XHG3M",
          configRef: "XHG3M-SD",
          type: "base",
        },
      ])
    ).toBe("XHG3M-SD");
  });
});

describe("getBomShortDesignation", () => {
  it("raccourcit les options connues par SKU", () => {
    expect(
      getBomShortDesignation({
        sku: "DTIMP4RJ45",
        label: "DTI RJ45 pré-câblé 4 RJ45 0,40 m",
        type: "option",
      })
    ).toBe("DTI RJ45, 4 ports");
  });

  it("formate la ligne châssis", () => {
    expect(
      getBomShortDesignation({
        sku: "XHG3M",
        label: "M 250 — Grade 3 TV",
        type: "base",
      })
    ).toBe("M 250 · G3 TV");
  });

  it("raccourcit les lignes INCLUS", () => {
    expect(
      getBomShortDesignation({
        sku: "INCLUS",
        label: "Capot — fourni avec le coffret",
        type: "materiau",
      })
    ).toBe("Capot (fourni)");
  });
});
