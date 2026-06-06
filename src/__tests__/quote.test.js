import { describe, it, expect } from "vitest";
import { buildQuoteText } from "../utils/quote.js";

describe("quote", () => {
  it("structure le récapitulatif par sections hiérarchisées", () => {
    const text = buildQuoteText(
      {
        gammeId: "xh-m-250",
        materiau: "grade3",
        coffretCount: 3,
        options: {
          dti_rj45: "",
          dti_fibre: "",
          rj45: "",
          cordon_rj45: "",
          tv: "",
          terre: "",
          prise: "",
          etagere_box: "",
          capot: "",
          porte: "",
          brassage: "brassage-interieur",
        },
      },
      {
        clientName: "Jean Dupont",
        societe: "ACME",
        email: "jean@acme.fr",
        telephone: "0612345678",
        commentaire: "Installation prévue en juillet",
      },
      [
        {
          sku: "XHG3M",
          label: "M 250 — Grade 3 TV",
          quantity: 1,
          type: "base",
          unitPriceHT: 62,
          lineTotalHT: 62,
        },
      ],
      "S"
    );

    expect(text.indexOf("--- COORDONNÉES ---")).toBeLessThan(
      text.indexOf("--- QUANTITÉ DEMANDÉE ---")
    );
    expect(text.indexOf("--- QUANTITÉ DEMANDÉE ---")).toBeLessThan(
      text.indexOf("--- NOMENCLATURE (PAR COFFRET) ---")
    );
    expect(text.indexOf("--- NOMENCLATURE (PAR COFFRET) ---")).toBeLessThan(
      text.indexOf("--- ESTIMATION INDICATIVE ---")
    );
    expect(text.indexOf("--- ESTIMATION INDICATIVE ---")).toBeLessThan(
      text.indexOf("--- COMMENTAIRE CLIENT ---")
    );

    expect(text).toContain("Nom : Jean Dupont");
    expect(text).toContain("Nombre de coffrets : 3");
    expect(text).not.toContain("Résumé :");
    expect(text).toContain("  • 1× XHG3M");
    expect(text).toContain("Prix unitaire HT");
    expect(text).toContain("Total HT (3 coffrets)");
    expect(text).toContain("  Installation prévue en juillet");
  });
});
