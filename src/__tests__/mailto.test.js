import { describe, it, expect, vi } from "vitest";
import { buildMailtoLink } from "../utils/mailto.js";

vi.mock("../utils/quoteFormat.js", () => ({
  buildStructuredQuoteBody: vi.fn(({ mode, shareUrl }) =>
    mode === "full" ? "x".repeat(3000) : `short body\n${shareUrl ?? ""}`
  ),
}));

describe("mailto", () => {
  const baseParams = {
    state: {
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
        brassage: "",
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
    expect(decodeURIComponent(href)).toContain("config=");
    expect(href.length).toBeLessThan(4000);
  });

  it("utilise une version courte hiérarchisée avec lien de configuration", () => {
    const href = decodeURIComponent(buildMailtoLink(baseParams));
    expect(href).toContain("Bonjour,");
    expect(href).toContain("configurateur XH'system");
    expect(href).toContain("short body");
    expect(href).toContain("config=");
    expect(href).toContain("Cordialement");
  });
});
