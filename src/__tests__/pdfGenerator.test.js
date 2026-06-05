import { describe, expect, it } from "vitest";
import { formatPdfPrice } from "../utils/pdfGenerator.js";

describe("formatPdfPrice", () => {
  it("formate avec espace classique (compatible jsPDF)", () => {
    expect(formatPdfPrice(3570)).toBe("3 570,00 €");
    expect(formatPdfPrice(5710.25)).toBe("5 710,25 €");
  });

  it("n’utilise pas l’espace fine insécable d’Intl", () => {
    const formatted = formatPdfPrice(1234.5);
    expect(formatted).not.toMatch(/\u202f/);
    expect(formatted).not.toMatch(/\u00a0/);
  });
});
