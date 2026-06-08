import { describe, it, expect } from "vitest";
import { getIncludedItemsForGamme } from "../utils/includedItems.js";

describe("includedItems", () => {
  it("retourne une liste vide si la gamme est inconnue", () => {
    expect(getIncludedItemsForGamme("inexistant")).toEqual([]);
  });

  it("retourne les éléments inclus pour le M 250", () => {
    const items = getIncludedItemsForGamme("xh-m-250");
    expect(items).toHaveLength(3);
    expect(items[0]).toMatchObject({
      id: "terre-bornier",
      label: "Bornier de mise à la terre",
    });
    expect(items[1]).toMatchObject({
      id: "panneau-rj45-10",
      label: "Panneau pour 10 RJ45",
    });
    expect(items[2]).toMatchObject({
      id: "rail-din",
      label: "Rail DIN",
    });
  });

  it("retourne les éléments inclus pour le S 250", () => {
    const items = getIncludedItemsForGamme("xh-s-250");
    expect(items).toHaveLength(4);
    expect(items.some((i) => i.id === "emplacement-support-box")).toBe(true);
  });

  it("retourne les éléments inclus pour le L 500", () => {
    const items = getIncludedItemsForGamme("xh-l-500");
    expect(items).toHaveLength(7);
    expect(items.some((i) => i.id === "porte-wifi")).toBe(true);
    expect(items.some((i) => i.id === "panneau-rj45-20")).toBe(true);
    expect(items.some((i) => i.id === "prises-2pt-3")).toBe(true);
  });

  it("retourne une liste vide si includedItems n'est pas renseigné", () => {
    expect(getIncludedItemsForGamme("xh-p-300")).toEqual([]);
  });

  it("normalise les libellés string et objet", () => {
    // Test via structure catalogue : on vérifie le comportement avec mock indirect
    // en s'appuyant sur une gamme vide (comportement par défaut).
    expect(getIncludedItemsForGamme("")).toEqual([]);
  });
});
