import { describe, expect, it } from "vitest";
import {
  hasConfiguredOptions,
  isGroupConfigured,
  isGroupResolved,
  isExplicitNoneChoice,
  isOptionsStepComplete,
  shouldShowAccordionClear,
  getNextAccordionGroup,
} from "../utils/progress.js";

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
    brassage: "",
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

  it("isOptionsStepComplete exige une option hors défaut", () => {
    expect(isOptionsStepComplete(baseState)).toBe(false);
    expect(
      isOptionsStepComplete({
        ...baseState,
        options: { ...baseState.options, brassage: "brassage-interieur" },
      })
    ).toBe(false);
    expect(
      isOptionsStepComplete({
        ...baseState,
        options: { ...baseState.options, tv: "tv-2" },
      })
    ).toBe(true);
  });

  it("shouldShowAccordionClear pour les groupes optionnels même sans sélection", () => {
    expect(shouldShowAccordionClear("dti_rj45", baseState)).toBe(true);
    expect(shouldShowAccordionClear("brassage", baseState)).toBe(false);
    expect(
      shouldShowAccordionClear("brassage", {
        ...baseState,
        options: { ...baseState.options, brassage: "brassage-exterieur" },
      })
    ).toBe(true);
  });

  it("getNextAccordionGroup n'avance qu'après une modification du groupe ouvert", () => {
    const withTv = {
      ...baseState,
      options: { ...baseState.options, tv: "tv-2" },
    };
    expect(getNextAccordionGroup(withTv, "tv", null, null, {})).toBeNull();
    expect(getNextAccordionGroup(withTv, "dti_rj45", "tv", null, {})).toBeNull();
    const next = getNextAccordionGroup(withTv, "tv", "tv", null, {});
    expect(next).not.toBeNull();
    expect(next).not.toBe("tv");
    expect(isGroupResolved(next, withTv, {})).toBe(false);
  });

  it("isGroupResolved après un Aucun explicite sur un groupe quantité", () => {
    expect(isGroupResolved("rj45", baseState, {})).toBe(false);
    expect(isGroupResolved("rj45", baseState, { rj45: true })).toBe(true);
  });

  it("isExplicitNoneChoice uniquement après validation explicite", () => {
    expect(isExplicitNoneChoice("rj45", baseState, {})).toBe(false);
    expect(isExplicitNoneChoice("rj45", baseState, { rj45: true })).toBe(true);
    expect(
      isExplicitNoneChoice(
        "rj45",
        { ...baseState, options: { ...baseState.options, rj45: "4" } },
        { rj45: true }
      )
    ).toBe(false);
  });

  it("getNextAccordionGroup avance après un Aucun explicite", () => {
    const next = getNextAccordionGroup(baseState, "rj45", null, "rj45", {
      rj45: true,
    });
    expect(next).not.toBeNull();
    expect(next).not.toBe("rj45");
  });
});
