import { describe, it, expect } from "vitest";
import { encodeConfig, decodeConfig, generateConfigCode } from "../utils/configCode.js";

describe("configCode", () => {
  const state = {
    gammeId: "xh-m-250",
    materiau: "grade3",
    options: {
      dti_rj45: "",
      dti_fibre: "",
      rj45: "",
      tv: "tv-4",
      terre: "",
      prise: "",
      etagere_box: "",
      capot: "",
      porte: "",
    },
  };

  it("encode et decode une configuration", () => {
    const encoded = encodeConfig(state);
    const decoded = decodeConfig(encoded);
    expect(decoded.gammeId).toBe(state.gammeId);
    expect(decoded.materiau).toBe(state.materiau);
    expect(decoded.options.tv).toBe("tv-4");
  });

  it("génère un code lisible", () => {
    const code = generateConfigCode(state);
    expect(code).toContain("COF-");
    expect(code).toContain("tv:4");
  });
});
