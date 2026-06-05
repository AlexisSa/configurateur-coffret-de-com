import { describe, expect, it } from "vitest";
import {
  hasConfiguredOptions,
  isGroupConfigured,
  isOptionsStepComplete,
} from "../utils/progress.js";

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
  },
};

describe("progress", () => {
  it("détecte un groupe configuré", () => {
    expect(isGroupConfigured("dti_rj45", baseState)).toBe(false);
    expect(
      isGroupConfigured("dti_rj45", {
        ...baseState,
        options: { ...baseState.options, dti_rj45: "dti-rj45-4precable" },
      })
    ).toBe(true);
    expect(
      isGroupConfigured("rj45", {
        ...baseState,
        options: { ...baseState.options, rj45: "4" },
      })
    ).toBe(true);
  });

  it("hasConfiguredOptions reflète au moins une sélection", () => {
    expect(hasConfiguredOptions(baseState)).toBe(false);
    expect(
      hasConfiguredOptions({
        ...baseState,
        options: { ...baseState.options, tv: "tv-2" },
      })
    ).toBe(true);
  });

  it("isOptionsStepComplete inclut le passage volontaire", () => {
    expect(isOptionsStepComplete(baseState)).toBe(false);
    expect(isOptionsStepComplete(baseState, { optionsSkipped: true })).toBe(
      true
    );
  });
});
