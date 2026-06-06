import { describe, it, expect, vi } from "vitest";
import { buildMailtoLink } from "../utils/mailto.js";

vi.mock("../utils/quote.js", () => ({
  buildQuoteText: vi.fn(() => "x".repeat(3000)),
}));

describe("mailto", () => {

  const baseParams = {
    state: {
      gammeId: "xh-m-250",
      materiau: "grade3",
      coffretCount: 1,
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
      },
    },
    internal: {
      clientName: "Jean Dupont",
      societe: "ACME",
      email: "jean@acme.fr",
      telephone: "0612345678",
    },
    bom: [
      {
        sku: "XHG3M",
        label: "M 250",
        quantity: 1,
        type: "base",
        unitPriceHT: 95,
        lineTotalHT: 95,
      },
    ],
    pricingTierCode: "S",
    configCode: "COF-XH-M-250|GRA|tv:4",
  };

  it("tronque le corps si le récapitulatif complet est trop long", () => {
    const href = buildMailtoLink(baseParams);
    expect(href).toContain("mailto:commercial@xeilom.fr");
    expect(href).toContain("lien%20de%20configuration");
    expect(href.length).toBeLessThan(4000);
  });

  it("inclut le récapitulatif court quand le corps est tronqué", () => {
    const href = decodeURIComponent(buildMailtoLink(baseParams));
    expect(href).toContain("Jean Dupont");
    expect(href).toContain("config=");
  });
});
