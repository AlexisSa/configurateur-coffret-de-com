import { describe, it, expect } from "vitest";
import { buildBom, getConfigurationSummary } from "../utils/bomBuilder.js";

const state = {
  gammeId: "xh-m-250",
  materiau: "grade3",
  options: {
    dti_rj45: "dti-rj45-4precable",
    dti_fibre: "",
    rj45: "4",
    cordon_rj45: "2",
    tv: "tv-4",
    terre: "",
    prise: "",
    etagere_box: "",
    capot: "",
    porte: "",
    brassage: "brassage-interieur",
  },
};

describe("bomBuilder", () => {
  it("retourne une liste vide si configuration incomplète", () => {
    expect(buildBom({ gammeId: "", materiau: "", options: {} })).toEqual([]);
  });

  it("inclut le châssis XH'system et les options sélectionnées", () => {
    const bom = buildBom(state);
    const skus = bom.map((l) => l.sku);
    expect(skus).toContain("XHG3M");
    expect(skus).toContain("DTIMP4RJ45");
    expect(skus).toContain("SPLITF-4");
    expect(bom.find((l) => l.sku === "KJ6AFSEF1")?.quantity).toBe(4);
    expect(bom.find((l) => l.sku === "DTIMP4RJ45")?.productUrl).toContain("dti-rj45");
    expect(bom.find((l) => l.sku === "KJ6AFSEF1")?.productUrl).toContain("embase-rj45");
    expect(bom.find((l) => l.sku === "CR6ASSTPOH0.5GS")?.quantity).toBe(2);
    expect(bom.find((l) => l.sku === "CR6ASSTPOH0.5GS")?.productUrl).toContain(
      "cordon-rj45"
    );
  });

  it("n’inclut pas les éléments fournis avec le coffret (porte, capot, prises)", () => {
    const bom = buildBom({
      gammeId: "xh-mx-350",
      materiau: "grade3",
      options: state.options,
    });
    const labels = bom.map((l) => l.label).join(" ");
    expect(labels).not.toContain("Capot");
    expect(labels).not.toContain("Porte");
    expect(bom.every((l) => l.sku !== "INCLUS")).toBe(true);
  });

  it("décompose 24 embases en lot KJ6AFSEF1-24", () => {
    const bom = buildBom({
      gammeId: "xh-xl-625",
      materiau: "grade3",
      options: {
        ...state.options,
        rj45: "20",
      },
    });
    const embaseLines = bom.filter((l) => l.sku.startsWith("KJ6AFSEF1"));
    const totalEmbases = embaseLines.reduce((sum, l) => {
      if (l.sku === "KJ6AFSEF1-24") return sum + l.quantity * 24;
      return sum + l.quantity;
    }, 0);
    expect(totalEmbases).toBe(20);
    expect(embaseLines.some((l) => l.sku === "KJ6AFSEF1")).toBe(true);
  });

  it("génère un résumé lisible", () => {
    const summary = getConfigurationSummary(state);
    expect(summary).toContain("M 250");
    expect(summary).toContain("Grade 3");
    expect(summary).toContain("Répartiteur TV 4");
  });

  it("multiplie les quantités par le nombre de coffrets", () => {
    const bom = buildBom({ ...state, coffretCount: 3 });
    expect(bom.find((l) => l.sku === "XHG3M")?.quantity).toBe(3);
    expect(bom.find((l) => l.sku === "KJ6AFSEF1")?.quantity).toBe(12);
    expect(getConfigurationSummary({ ...state, coffretCount: 3 })).toContain("3×");
  });

  it("utilise le châssis -E pour le brassage extérieur", () => {
    const exteriorState = {
      ...state,
      options: { ...state.options, brassage: "brassage-exterieur" },
    };
    const bom = buildBom(exteriorState);
    expect(bom.find((l) => l.type === "base")?.sku).toBe("XHG3M-E");
    expect(bom.find((l) => l.type === "base")?.label).toContain("brassage extérieur");
    expect(bom.some((l) => l.label?.includes("Brassage extérieur"))).toBe(false);
    expect(getConfigurationSummary(exteriorState)).toContain("Brassage extérieur");
  });
});
