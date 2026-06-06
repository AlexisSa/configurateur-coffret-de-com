import { describe, it, expect } from "vitest";
import {
  encodeConfig,
  encodeConfigLegacy,
  decodeConfig,
  generateConfigCode,
  MAX_CONFIG_PARAM_LENGTH,
} from "../utils/configCode.js";

describe("configCode", () => {
  const state = {
    gammeId: "xh-m-250",
    materiau: "grade3",
    options: {
      dti_rj45: "",
      dti_fibre: "",
      rj45: "",
      cordon_rj45: "",
      tv: "tv-4",
      terre: "",
      prise: "",
      etagere_box: "",
      capot: "",
      porte: "",
    },
  };

  it("encode et decode une configuration (base64url)", () => {
    const encoded = encodeConfig(state);
    expect(encoded).not.toContain("+");
    expect(encoded).not.toContain("/");
    const decoded = decodeConfig(encoded);
    expect(decoded.gammeId).toBe(state.gammeId);
    expect(decoded.materiau).toBe(state.materiau);
    expect(decoded.options.tv).toBe("tv-4");
  });

  it("décode les liens legacy", () => {
    const legacy = encodeConfigLegacy(state);
    const decoded = decodeConfig(legacy);
    expect(decoded.gammeId).toBe(state.gammeId);
    expect(decoded.options.tv).toBe("tv-4");
  });

  it("rejette un paramètre trop long", () => {
    expect(decodeConfig("a".repeat(MAX_CONFIG_PARAM_LENGTH + 1))).toBeNull();
  });

  it("génère un code lisible", () => {
    const code = generateConfigCode(state);
    expect(code).toContain("COF-");
    expect(code).toContain("tv:4");
  });
});
