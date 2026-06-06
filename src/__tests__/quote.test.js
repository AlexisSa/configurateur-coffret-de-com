import { describe, it, expect } from "vitest";
import { buildQuoteText } from "../utils/quote.js";

describe("quote", () => {
  it("inclut le commentaire client dans le récapitulatif", () => {
    const text = buildQuoteText(
      {
        gammeId: "xh-m-250",
        materiau: "grade3",
        coffretCount: 1,
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

    expect(text).toContain("Commentaire :");
    expect(text).toContain("Installation prévue en juillet");
  });
});
