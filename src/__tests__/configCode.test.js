import { describe, it, expect } from "vitest";
import {
  encodeConfig,
  encodeConfigLegacy,
  decodeConfig,
  generateConfigCode,
  buildShareUrl,
  getShareBaseUrl,
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
      brassage: "",
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

  it("utilise la page Oxatis comme base du lien de partage", () => {
    const shareUrl = buildShareUrl(state);
    expect(shareUrl).toMatch(/^https:\/\/www\.xeilom\.fr\/PBCPPlayer\.asp\?/);
    expect(shareUrl).toContain("ID=2542607");
    expect(shareUrl).toContain("config=");
    expect(shareUrl).not.toContain("vercel.app");
  });

  it("retire un paramètre config existant de la base de partage", () => {
    const base = getShareBaseUrl();
    expect(base.searchParams.has("config")).toBe(false);
    expect(base.searchParams.get("ID")).toBe("2542607");
  });
});
