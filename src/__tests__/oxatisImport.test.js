import { describe, it, expect } from "vitest";
import {
  parseOxatisCsvLine,
  parseOxatisPriceHT,
} from "../../scripts/lib/parseOxatisCsv.mjs";
import { OXATIS_TIER_COLUMNS } from "../../scripts/lib/oxatisPricingColumns.mjs";

describe("parseOxatisCsv", () => {
  it("parse les prix avec virgule décimale", () => {
    expect(parseOxatisPriceHT("21,5")).toBe(21.5);
    expect(parseOxatisPriceHT("")).toBeNull();
  });

  it("mappe les colonnes Oxatis vers les tarifs S–Z", () => {
    expect(OXATIS_TIER_COLUMNS.S).toBe("Price2VATExcluded");
    expect(OXATIS_TIER_COLUMNS.Z).toBe("Price6VATExcluded");
  });

  it("extrait ItemSKU et tarifs d'une ligne CSV", () => {
    const line =
      '"123";"DTIMP4RJ45";"Nom";;;"desc";;"10";"20,00";"25";"21,5";"20";"18";"16";"30";"25,5";"24";"21,6";"19,2"';
    const cols = parseOxatisCsvLine(line);
    expect(cols[1]).toBe("DTIMP4RJ45");
    expect(parseOxatisPriceHT(cols[10])).toBe(21.5);
  });
});
