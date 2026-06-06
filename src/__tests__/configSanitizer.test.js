import { describe, it, expect } from "vitest";
import {
  validateAndNormalizeConfig,
  sanitizeOptionsForState,
} from "../utils/configSanitizer.js";
import { buildBom } from "../utils/bomBuilder.js";

const baseOptions = {
  dti_rj45: "",
  dti_fibre: "",
  rj45: "",
  cordon_rj45: "",
  tv: "",
  terre: "",
  prise: "",
  etagere_box: "",
  capot: "",
  porte: "",
  brassage: "",
};

describe("configSanitizer", () => {
  it("rejette une gamme inconnue", () => {
    expect(
      validateAndNormalizeConfig({ gammeId: "inexistant", options: baseOptions })
    ).toBeNull();
  });

  it("retire etagere-box sur une gamme non compatible", () => {
    const result = validateAndNormalizeConfig({
      gammeId: "xh-m-250",
      materiau: "grade3",
      options: { ...baseOptions, etagere_box: "etagere-box" },
    });
    expect(result?.state.options.etagere_box).toBe("");
    expect(result?.warnings.length).toBeGreaterThan(0);
  });

  it("retire capot-s250 sur une gamme non compatible", () => {
    const result = validateAndNormalizeConfig({
      gammeId: "xh-m-250",
      materiau: "grade3",
      options: { ...baseOptions, capot: "capot-s250" },
    });
    expect(result?.state.options.capot).toBe("");
    expect(result?.warnings.length).toBeGreaterThan(0);
  });

  it("clamp la quantité RJ45 au maximum de la gamme", () => {
    const result = validateAndNormalizeConfig({
      gammeId: "xh-m-250",
      materiau: "grade3",
      options: { ...baseOptions, rj45: "15" },
    });
    expect(result?.state.options.rj45).toBe("10");
  });

  it("exclut les options invalides de la BOM", () => {
    const result = validateAndNormalizeConfig({
      gammeId: "xh-m-250",
      materiau: "grade3",
      options: { ...baseOptions, capot: "capot-s250", tv: "tv-4" },
    });
    const bom = buildBom(result.state);
    const skus = bom.map((l) => l.sku);
    expect(skus).toContain("SPLITF-4");
    expect(skus).not.toContain("XH-S-CAPOT");
  });

  it("applique le brassage intérieur par défaut sur M 250", () => {
    const result = validateAndNormalizeConfig({
      gammeId: "xh-m-250",
      materiau: "grade3",
      options: baseOptions,
    });
    expect(result?.state.options.brassage).toBe("brassage-interieur");
  });

  it("sanitizeOptionsForState conserve les options compatibles", () => {
    const state = {
      gammeId: "xh-m-250",
      materiau: "grade3",
      coffretCount: 1,
      options: { ...baseOptions, tv: "tv-4" },
    };
    const { options, warnings } = sanitizeOptionsForState(state);
    expect(options.tv).toBe("tv-4");
    expect(warnings).toHaveLength(0);
  });
});
