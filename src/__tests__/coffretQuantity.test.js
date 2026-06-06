import { describe, it, expect } from "vitest";
import {
  MIN_COFFRET_COUNT,
  normalizeCoffretCount,
} from "../utils/coffretQuantity.js";

describe("coffretQuantity", () => {
  it("borne entre 3 et 1000", () => {
    expect(normalizeCoffretCount(0)).toBe(MIN_COFFRET_COUNT);
    expect(normalizeCoffretCount(1)).toBe(MIN_COFFRET_COUNT);
    expect(normalizeCoffretCount(2)).toBe(MIN_COFFRET_COUNT);
    expect(normalizeCoffretCount(3)).toBe(3);
    expect(normalizeCoffretCount(150)).toBe(150);
    expect(normalizeCoffretCount(2000)).toBe(1000);
  });
});
