import { describe, it, expect } from "vitest";
import { buildStructuredQuoteBody } from "../utils/quoteFormat.js";

describe("quoteFormat", () => {
  const baseState = {
    gammeId: "xh-m-250",
    materiau: "grade3",
    coffretCount: 3,
    options: {
      dti_rj45: "",
      dti_fibre: "",
      rj45: "",
      cordon_rj45: "",
      tv: "tv-4",
      terre: "",
      prise: "",
      etagere_box: "",
      capot: "",
      porte: "",
      brassage: "brassage-interieur",
    },
  };

  const internal = {
    clientName: "Jean Dupont",
    societe: "ACME",
    email: "jean@acme.fr",
    telephone: "0612345678",
    commentaire: "Livraison urgente",
  };

  const bom = [
    {
      sku: "XHG3M",
      label: "M 250 — Grade 3 TV",
      quantity: 1,
      type: "base",
      unitPriceHT: 62,
      lineTotalHT: 62,
    },
  ];

  it("place les coordonnées client avant la configuration", () => {
    const text = buildStructuredQuoteBody({
      state: baseState,
      internal,
      bom,
      pricingTierCode: "S",
      mode: "full",
    });

    expect(text.indexOf("COORDONNÉES CLIENT")).toBeLessThan(
      text.indexOf("CONFIGURATION DEMANDÉE")
    );
    expect(text).toContain("Email : jean@acme.fr");
  });

  it("remplace la nomenclature par un lien en mode court", () => {
    const text = buildStructuredQuoteBody({
      state: baseState,
      internal,
      bom,
      pricingTierCode: "S",
      mode: "short",
      shareUrl: "https://example.com/?config=abc",
    });

    expect(text).not.toContain("• 1× XHG3M");
    expect(text).toContain("--- NOMENCLATURE ---");
    expect(text).toContain("https://example.com/?config=abc");
  });
});
