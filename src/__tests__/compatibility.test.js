import { describe, it, expect } from "vitest";
import {
  isOptionSelectable,
  isGroupHidden,
  getVisibleGroups,
  isConfigurationComplete,
} from "../utils/compatibility.js";
import {
  getMaxRj45Count,
  getRj45QuantityError,
  normalizeRj45Value,
  parseRj45Quantity,
} from "../utils/rj45.js";
import { buildBom } from "../utils/bomBuilder.js";

const baseState = {
  gammeId: "xh-m-250",
  materiau: "grade3",
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

describe("compatibility", () => {
  it("marque la configuration complète avec gamme et grade", () => {
    expect(isConfigurationComplete(baseState)).toBe(true);
    expect(isConfigurationComplete({ ...baseState, materiau: "" })).toBe(false);
  });

  it("autorise DTI RJ45 et DTI fibre en même temps", () => {
    const state = {
      ...baseState,
      options: {
        ...baseState.options,
        dti_rj45: "dti-rj45-4precable",
        dti_fibre: "dti-fibre-2",
      },
    };
    expect(isOptionSelectable("dti-rj45-4precable", state)).toBe(true);
    expect(isOptionSelectable("dti-fibre-2", state)).toBe(true);
    expect(isOptionSelectable("dti-fibre-4", state)).toBe(true);
  });

  it("permet de remplacer une option par une autre du même groupe", () => {
    const tvState = { ...baseState, options: { ...baseState.options, tv: "tv-4" } };
    expect(isOptionSelectable("tv-8", tvState)).toBe(true);

    const dtiState = {
      ...baseState,
      options: { ...baseState.options, dti_fibre: "dti-fibre-2" },
    };
    expect(isOptionSelectable("dti-fibre-4", dtiState)).toBe(true);
  });

  it("limite les RJ45 à 10 sur la plupart des gammes", () => {
    expect(getMaxRj45Count("xh-mx-350")).toBe(10);
    expect(getRj45QuantityError(10, "xh-mx-350")).toBeNull();
    expect(getRj45QuantityError(11, "xh-mx-350")).toContain("10");
  });

  it("autorise une quantité RJ45 personnalisée valide", () => {
    const state = {
      ...baseState,
      gammeId: "xh-m-250",
      options: { ...baseState.options, rj45: "7" },
    };
    expect(getRj45QuantityError(7, state.gammeId)).toBeNull();
    const bom = buildBom(state);
    expect(bom.find((l) => l.sku === "KJ6AFSEF1")?.quantity).toBe(7);
  });

  it("masque le groupe capot hors S et SX (MX 350)", () => {
    const state = { ...baseState, gammeId: "xh-mx-350" };
    expect(isGroupHidden("capot", state)).toBe(true);
    const groups = getVisibleGroups(state);
    expect(groups).not.toContain("capot");
  });

  it("affiche le capot en option pour S 250", () => {
    const state = { ...baseState, gammeId: "xh-s-250" };
    expect(isGroupHidden("capot", state)).toBe(false);
    expect(isOptionSelectable("capot-s250", state)).toBe(true);
  });

  it("masque etagere_box hors L et XL (P 300)", () => {
    const state = { ...baseState, gammeId: "xh-p-300" };
    expect(isGroupHidden("etagere_box", state)).toBe(true);
  });

  it("propose XH-ET-LXL uniquement sur L 500 et XL 625", () => {
    expect(isGroupHidden("etagere_box", { ...baseState, gammeId: "xh-l-500" })).toBe(
      false
    );
    expect(isOptionSelectable("etagere-box", { ...baseState, gammeId: "xh-l-500" })).toBe(
      true
    );
    expect(isGroupHidden("etagere_box", { ...baseState, gammeId: "xh-s-250" })).toBe(
      true
    );
    expect(
      isOptionSelectable("etagere-box", { ...baseState, gammeId: "xh-s-250" })
    ).toBe(false);
  });

  it("masque les prises si déjà incluses (ML 500)", () => {
    const state = { ...baseState, gammeId: "xh-ml-500" };
    expect(isGroupHidden("prise", state)).toBe(true);
  });

  it("autorise jusqu'à 20 RJ45 sur L et XL uniquement", () => {
    expect(getMaxRj45Count("xh-xl-625")).toBe(20);
    expect(getRj45QuantityError(20, "xh-xl-625")).toBeNull();
    expect(getRj45QuantityError(21, "xh-xl-625")).toContain("20");
    expect(getMaxRj45Count("xh-m2-250")).toBe(10);
    expect(getRj45QuantityError(11, "xh-m2-250")).toContain("10");
  });

  it("convertit les anciennes valeurs rj45-N", () => {
    expect(normalizeRj45Value("rj45-6")).toBe("6");
    expect(parseRj45Quantity("rj45-20")).toBe(20);
  });

  it("masque les prises sur M2 250", () => {
    const state = { ...baseState, gammeId: "xh-m2-250" };
    expect(isGroupHidden("prise", state)).toBe(true);
  });

  it("masque capot et etagere sur MXL 615", () => {
    const state = { ...baseState, gammeId: "xh-mxl-615" };
    expect(isGroupHidden("capot", state)).toBe(true);
    expect(isGroupHidden("etagere_box", state)).toBe(true);
  });
});
