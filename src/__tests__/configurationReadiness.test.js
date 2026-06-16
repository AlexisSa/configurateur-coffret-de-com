import { describe, expect, it } from "vitest";
import {
  getConfiguredGroupsProgress,
  hasNonDefaultConfiguredOptions,
  isConfigurationReady,
  isDefaultGammeOption,
  isUserConfiguredOption,
} from "../utils/configurationReadiness.js";

const baseState = {
  gammeId: "xh-m-250",
  materiau: "grade3",
  coffretCount: 1,
  options: {
    dti_rj45: "",
    dti_fibre: "",
    rj45: "",
    cordon_rj45: "",
    tv: "",
    cordon_balun: "",
    rehausse: "",
    prise: "",
    etagere_box: "",
    capot: "",
    porte: "",
    brassage: "brassage-interieur",
  },
};

describe("configurationReadiness", () => {
  it("ignore le brassage intérieur pré-sélectionné", () => {
    expect(isDefaultGammeOption("brassage", baseState)).toBe(true);
    expect(isUserConfiguredOption("brassage", baseState)).toBe(false);
    expect(hasNonDefaultConfiguredOptions(baseState)).toBe(false);
    expect(isConfigurationReady(baseState)).toBe(false);
  });

  it("considère une option utilisateur comme prête", () => {
    const withTv = {
      ...baseState,
      options: { ...baseState.options, tv: "tv-4" },
    };
    expect(isUserConfiguredOption("tv", withTv)).toBe(true);
    expect(isConfigurationReady(withTv)).toBe(true);
  });

  it("compte la progression des groupes visibles", () => {
    const progress = getConfiguredGroupsProgress(baseState);
    expect(progress.total).toBeGreaterThan(0);
    expect(progress.configured).toBe(1);
  });
});
