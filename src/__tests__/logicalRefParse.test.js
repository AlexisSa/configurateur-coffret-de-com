import { describe, expect, it } from "vitest";
import { catalog } from "../utils/catalog.js";
import { getGammeById } from "../utils/catalog.js";
import {
  buildLogicalCoffretRef,
  parseLogicalCoffretRef,
} from "../utils/logicalRef.js";

const grade3 = { id: "grade3", skuSuffix: "" };

describe("parseLogicalCoffretRef", () => {
  it("décode une référence complète", () => {
    const ref = "XHG3XL-8RJ-P-E-DTI-DTIO2-3PC-4TV-4CRJ2CB";
    const parsed = parseLogicalCoffretRef(ref);
    expect(parsed).toMatchObject({
      gamme: "XL",
      rj45: 8,
      porte: true,
      brassageExt: true,
      dtiRj45: true,
      dtiFibre: 2,
      prises: 3,
      tv: 4,
      cordonsRj45: 4,
      cordonsBalun: 2,
    });
  });

  it("décode une référence sans RJ", () => {
    const ref = buildLogicalCoffretRef(getGammeById("xh-m-250"), grade3, {});
    const parsed = parseLogicalCoffretRef(ref);
    expect(parsed?.gamme).toBe("M");
    expect(parsed?.sansDti).toBe(true);
    expect(parsed?.rj45).toBe(0);
  });

  it("rejette une référence invalide", () => {
    expect(parseLogicalCoffretRef("INVALID")).toBeNull();
    expect(parseLogicalCoffretRef("XHG3M-FOO")).toBeNull();
  });

  it("round-trip sur les scénarios golden", () => {
    const gamme = catalog.gammes.find((g) => g.id === "xh-xl-625");
    const ref = buildLogicalCoffretRef(gamme, grade3, {
      rj45: "8",
      tv: "tv-3",
    });
    const parsed = parseLogicalCoffretRef(ref);
    expect(parsed?.rj45).toBe(8);
    expect(parsed?.tv).toBe(3);
    expect(parsed?.porte).toBe(true);
  });
});
