import { describe, it, expect } from "vitest";
import { getGammeById } from "../utils/catalog.js";
import {
  buildLogicalCoffretRef,
  getCordonRefSuffix,
  getDtiRj45RefSuffix,
  getDtioRefSuffix,
  getPriseRefSuffix,
  getStaticRefSuffixFromImageSku,
  getTvRefSuffix,
} from "../utils/logicalRef.js";

const grade3 = { id: "grade3", label: "Grade 3 TV", skuSuffix: "" };

describe("logicalRef", () => {
  it("extrait le suffixe fixe depuis imageSku", () => {
    expect(getStaticRefSuffixFromImageSku(getGammeById("xh-m-250"))).toBe("");
    expect(getStaticRefSuffixFromImageSku(getGammeById("xh-ml-500"))).toBe("TV");
    expect(getStaticRefSuffixFromImageSku(getGammeById("xh-xl-625"))).toBe("TVP");
  });

  it("encode le répartiteur TV uniquement si sélectionné", () => {
    expect(getTvRefSuffix({ tv: "tv-6" })).toBe("6TV");
    expect(getTvRefSuffix({})).toBe("");
    expect(getTvRefSuffix({ tv: "tv-3" })).toBe("3TV");
  });

  it("encode SD ou DTI RJ45 selon la sélection", () => {
    expect(getDtiRj45RefSuffix({})).toBe("SD");
    expect(getDtiRj45RefSuffix({ dti_rj45: "dti-rj45-4precable" })).toBe("DTI");
  });

  it("encode le DTI fibre en DTIO2 / DTIO4", () => {
    expect(getDtioRefSuffix({ dti_fibre: "dti-fibre-2" })).toBe("DTIO2");
    expect(getDtioRefSuffix({ dti_fibre: "dti-fibre-4" })).toBe("DTIO4");
    expect(getDtioRefSuffix({})).toBe("");
  });

  it("encode les cordons RJ45 et balun (les deux dès que l'un > 0)", () => {
    expect(
      getCordonRefSuffix({ cordon_rj45: "4", cordon_balun: "cordon-balun-rj45-f" })
    ).toBe("4CRJ1CB");
    expect(getCordonRefSuffix({ cordon_rj45: "4" })).toBe("4CRJ0CB");
    expect(getCordonRefSuffix({ cordon_balun: "cordon-balun-rj45-f" })).toBe("0CRJ1CB");
    expect(getCordonRefSuffix({})).toBe("");
  });

  it("encode les prises incluses ou en option", () => {
    expect(getPriseRefSuffix(getGammeById("xh-m-250"), {})).toBe("");
    expect(getPriseRefSuffix(getGammeById("xh-m-250"), { prise: "2" })).toBe("2PC");
    expect(getPriseRefSuffix(getGammeById("xh-ml-500"), {})).toBe("2PC");
    expect(getPriseRefSuffix(getGammeById("xh-xl-625"), {})).toBe("3PC");
  });

  it("génère XHG3XL-8RJ-P-SD-3PC sans répartiteur TV", () => {
    expect(
      buildLogicalCoffretRef(getGammeById("xh-xl-625"), grade3, { rj45: "8" })
    ).toBe("XHG3XL-8RJ-P-SD-3PC");
  });

  it("place le TV après les prises", () => {
    expect(
      buildLogicalCoffretRef(getGammeById("xh-xl-625"), grade3, {
        rj45: "8",
        tv: "tv-3",
      })
    ).toBe("XHG3XL-8RJ-P-SD-3PC-3TV");
  });

  it("remplace SD par DTI quand un DTI RJ45 est présent", () => {
    expect(
      buildLogicalCoffretRef(getGammeById("xh-xl-625"), grade3, {
        rj45: "8",
        tv: "tv-4",
        dti_rj45: "dti-rj45-4precable",
      })
    ).toBe("XHG3XL-8RJ-P-DTI-3PC-4TV");
  });

  it("génère XHG3M-4RJ-SD-6TV avec répartiteur 6 sorties", () => {
    expect(
      buildLogicalCoffretRef(getGammeById("xh-m-250"), grade3, {
        rj45: "4",
        tv: "tv-6",
      })
    ).toBe("XHG3M-4RJ-SD-6TV");
  });

  it("génère XHG3M-4RJ-2PC-4TV avec 2 prises en option et DTI RJ45", () => {
    expect(
      buildLogicalCoffretRef(getGammeById("xh-m-250"), grade3, {
        rj45: "4",
        tv: "tv-4",
        dti_rj45: "dti-rj45-4precable",
        prise: "2",
      })
    ).toBe("XHG3M-4RJ-DTI-2PC-4TV");
  });

  it("génère XHG3ML-4RJ-SD-DTIO2-2PC avec DTI fibre sans DTI RJ45", () => {
    expect(
      buildLogicalCoffretRef(getGammeById("xh-ml-500"), grade3, {
        rj45: "4",
        dti_fibre: "dti-fibre-2",
      })
    ).toBe("XHG3ML-4RJ-SD-DTIO2-2PC");
  });

  it("place E juste après le RJ et termine par le bloc cordons", () => {
    expect(
      buildLogicalCoffretRef(getGammeById("xh-m-250"), grade3, {
        rj45: "6",
        brassage: "brassage-exterieur",
        prise: "1",
        cordon_rj45: "3",
      })
    ).toBe("XHG3M-6RJ-E-SD-1PC-3CRJ0CB");
  });

  it("écrit le bloc cordons même si seul le balun est sélectionné", () => {
    expect(
      buildLogicalCoffretRef(getGammeById("xh-m-250"), grade3, {
        rj45: "4",
        dti_rj45: "dti-rj45-4precable",
        cordon_balun: "cordon-balun-rj45-f",
      })
    ).toBe("XHG3M-4RJ-DTI-0CRJ1CB");
  });

  it("génère les tokens de variante dès la gamme, sans embase RJ45", () => {
    expect(
      buildLogicalCoffretRef(getGammeById("xh-xl-625"), grade3, { rj45: "" })
    ).toBe("XHG3XL-P-SD-3PC");
    expect(
      buildLogicalCoffretRef(getGammeById("xh-m-250"), grade3, { rj45: "" })
    ).toBe("XHG3M-SD");
  });
});
