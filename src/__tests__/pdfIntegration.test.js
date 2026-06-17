import { describe, it, expect } from "vitest";
import { buildBom } from "../utils/bomBuilder.js";
import { createBomPdfBlob } from "../utils/pdfGenerator.js";

const state = {
  gammeId: "xh-m-250",
  materiau: "grade3",
  coffretCount: 1,
  options: {
    brassage: "brassage-exterieur",
    dti_rj45: "",
    dti_fibre: "",
    rj45: "4",
    cordon_rj45: "",
    tv: "",
    cordon_balun: "",
    rehausse: "",
    prise: "",
    etagere_box: "",
    capot: "",
    porte: "",
  },
};

describe("createBomPdfBlob integration", () => {
  it("génère un blob PDF non vide", async () => {
    const bom = buildBom(state, "S");
    expect(bom.length).toBeGreaterThan(0);
    const blob = await createBomPdfBlob(state, {}, "S");
    expect(blob).toBeTruthy();
    expect(blob.size).toBeGreaterThan(1000);
  });
});
