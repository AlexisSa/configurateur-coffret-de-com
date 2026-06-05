import { describe, it, expect } from "vitest";
import { normalizeCoffretCount } from "../utils/coffretQuantity.js";

describe("coffretQuantity", () => {
  it("borne entre 1 et 1000", () => {
    expect(normalizeCoffretCount(0)).toBe(1);
    expect(normalizeCoffretCount(150)).toBe(150);
    expect(normalizeCoffretCount(2000)).toBe(1000);
  });
});
