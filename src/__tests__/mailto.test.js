import { describe, it, expect } from "vitest";
import { buildMailtoLink } from "../utils/mailto.js";

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
        label: "M 250 — Grade 3 TV",
        quantity: 1,
        type: "base",
        unitPriceHT: 62,
        lineTotalHT: 62,
      },
      {
        sku: "SPLITF-4",
        label: "Répartiteur TV 4 sorties F",
        quantity: 1,
        type: "option",
        unitPriceHT: 5.46,
        lineTotalHT: 5.46,
      },
    ],
    pricingTierCode: "S",
    configCode: "COF-XH-M-250|GRA|tv:4",
  };

  it("inclut toujours la nomenclature détaillée sans lien de repli", () => {
    const href = decodeURIComponent(buildMailtoLink(baseParams));

    expect(href).toContain("mailto:commercial@xeilom.fr");
    expect(href).toContain("Bonjour,");
    expect(href).not.toContain("configurateur XH");
    expect(href).not.toContain("lien de configuration");
    expect(href).not.toContain("config=");
    expect(href).toContain("--- NOMENCLATURE (PAR COFFRET) ---");
    expect(href).toContain("• 1× XHG3M");
    expect(href).toContain("• 1× SPLITF-4");
    expect(href).toContain("Nombre de coffrets : 3");
    expect(href).not.toContain("Résumé :");
    expect(href).toContain("Cordialement");
  });
});
