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
    cordon_balun: "",
    prise: "",
    etagere_box: "",
    capot: "",
    rehausse: "",
    porte: "",
    brassage: "brassage-interieur",
  },
};

describe("bomBuilder", () => {
  it("retourne une liste vide si configuration incomplète", () => {
    expect(buildBom({ gammeId: "", materiau: "", options: {} })).toEqual([]);
  });

  it("n'ajoute pas le bornier en nomenclature s'il est inclus dans le coffret (M 250)", () => {
    const bom = buildBom(state);
    expect(bom.find((l) => l.sku === "BMT-PRD")).toBeUndefined();
  });

  it("facture le bornier de terre si non inclus dans le coffret", () => {
    const bom = buildBom({
      ...state,
      gammeId: "xh-p-300",
      options: { ...state.options, brassage: "" },
    });
    expect(bom.find((l) => l.sku === "BMT-PRD")?.quantity).toBe(1);
  });

  it("inclut le châssis XH'system et les options sélectionnées", () => {
    const bom = buildBom(state);
    const skus = bom.map((l) => l.sku);
    expect(skus).toContain("XHG3M");
    expect(bom.find((l) => l.type === "base")?.configRef).toBe(
      "XHG3M-4RJ-DTI-4TV-2CRJ0CB"
    );
    expect(skus).not.toContain("BMT-PRD");
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

  it("garde la nomenclature unitaire et indique le nombre de coffrets au résumé", () => {
    const bom = buildBom({ ...state, coffretCount: 3 });
    expect(bom.find((l) => l.sku === "XHG3M")?.quantity).toBe(1);
    expect(bom.find((l) => l.sku === "KJ6AFSEF1")?.quantity).toBe(4);
    expect(getConfigurationSummary({ ...state, coffretCount: 3 })).toContain("3×");
  });

  it("utilise la référence logique et le SKU tarifaire -E pour le brassage extérieur", () => {
    const exteriorState = {
      ...state,
      options: { ...state.options, brassage: "brassage-exterieur" },
    };
    const bom = buildBom(exteriorState);
    const base = bom.find((l) => l.type === "base");
    expect(base?.sku).toBe("XHG3M-E");
    expect(base?.configRef).toBe("XHG3M-4RJ-E-DTI-4TV-2CRJ0CB");
    expect(bom.find((l) => l.type === "base")?.label).toContain("brassage extérieur");
    expect(bom.some((l) => l.label?.includes("Brassage extérieur"))).toBe(false);
    expect(getConfigurationSummary(exteriorState)).toContain("Brassage extérieur");
  });

  it("inclut le cordon balun TV et la rehausse S quand sélectionnés", () => {
    const bom = buildBom({
      gammeId: "xh-s-250",
      materiau: "grade3",
      options: {
        ...state.options,
        brassage: "",
        cordon_balun: "cordon-balun-rj45-f",
        rehausse: "rehausse-s250",
        capot: "capot-s250",
      },
    });
    expect(bom.find((l) => l.sku === "CR503S78-0.5")?.quantity).toBe(1);
    expect(bom.find((l) => l.sku === "XH-S-REH")?.quantity).toBe(1);
    expect(bom.find((l) => l.sku === "XH-SX-REH")).toBeUndefined();
  });
});
