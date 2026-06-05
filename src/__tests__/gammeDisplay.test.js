import { describe, it, expect } from "vitest";
import { getGammeById } from "../utils/catalog.js";
import {
  formatGammeDimensions,
  getGammeSelectorSubtitle,
} from "../utils/gammeDisplay.js";

describe("gammeDisplay", () => {
  it("formate les dimensions H × L", () => {
    expect(formatGammeDimensions(getGammeById("xh-m-250"))).toBe(
      "H : 250 mm × L : 250 mm"
    );
    expect(formatGammeDimensions(getGammeById("xh-p-300"))).toBe(
      "H : 250 à 300 mm × L : 250 mm"
    );
  });

  it("affiche « avec porte » pour les gammes concernées", () => {
    expect(getGammeSelectorSubtitle(getGammeById("xh-mx-350"))).toBe(
      "avec porte"
    );
    expect(getGammeSelectorSubtitle(getGammeById("xh-m-250"))).toBeNull();
  });
});
