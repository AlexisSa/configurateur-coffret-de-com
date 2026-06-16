import { describe, it, expect } from "vitest";
import { catalog } from "../utils/catalog.js";
import { buildLogicalCoffretRef } from "../utils/logicalRef.js";

/**
 * Test golden : fige la référence logique produite pour chaque gamme sur des
 * scénarios représentatifs. But : toute modification de catalog.json ou de la
 * logique de nomenclature qui changerait une référence devient visible en revue
 * (la référence sert d'identifiant interne, elle doit rester stable dans le temps).
 *
 * Pour régénérer après un changement assumé, comparer aux valeurs attendues.
 */
const grade3 = { id: "grade3", skuSuffix: "" };

/** Scénarios appliqués à chaque gamme. */
const SCENARIOS = {
  base: { rj45: "" },
  rj4: { rj45: "4" },
  full: {
    rj45: "8",
    tv: "tv-4",
    dti_fibre: "dti-fibre-2",
    prise: "2",
    brassage: "brassage-exterieur",
    cordon_rj45: "4",
    cordon_balun: "cordon-balun-rj45-f",
  },
};

/** Références attendues, épinglées (gammeId → scénario → réf). */
const EXPECTED = {
  "xh-p-300": { base: "XHG3T-SD", rj4: "XHG3T-4RJ-SD", full: "XHG3T-8RJ-E-SD-DTIO2-2PC-4TV-4CRJ1CB" },
  "xh-m-250": { base: "XHG3M-SD", rj4: "XHG3M-4RJ-SD", full: "XHG3M-8RJ-E-SD-DTIO2-2PC-4TV-4CRJ1CB" },
  "xh-mx-350": { base: "XHG3MX-SD", rj4: "XHG3MX-4RJ-SD", full: "XHG3MX-8RJ-E-SD-DTIO2-2PC-4TV-4CRJ1CB" },
  "xh-ml-500": { base: "XHG3ML-SD-2PC", rj4: "XHG3ML-4RJ-SD-2PC", full: "XHG3ML-8RJ-E-SD-DTIO2-2PC-4TV-4CRJ1CB" },
  "xh-mxl-615": { base: "XHG3MXL-SD", rj4: "XHG3MXL-4RJ-SD", full: "XHG3MXL-8RJ-E-SD-DTIO2-2PC-4TV-4CRJ1CB" },
  "xh-s-250": { base: "XHG3S-SD", rj4: "XHG3S-4RJ-SD", full: "XHG3S-8RJ-E-SD-DTIO2-2PC-4TV-4CRJ1CB" },
  "xh-sx-350": { base: "XHG3SX-SD", rj4: "XHG3SX-4RJ-SD", full: "XHG3SX-8RJ-E-SD-DTIO2-2PC-4TV-4CRJ1CB" },
  "xh-l-500": { base: "XHG3L-P-SD-3PC", rj4: "XHG3L-4RJ-P-SD-3PC", full: "XHG3L-8RJ-P-E-SD-DTIO2-3PC-4TV-4CRJ1CB" },
  "xh-xl-625": { base: "XHG3XL-P-SD-3PC", rj4: "XHG3XL-4RJ-P-SD-3PC", full: "XHG3XL-8RJ-P-E-SD-DTIO2-3PC-4TV-4CRJ1CB" },
  "xh-m2-250": { base: "XHG3M2-SD", rj4: "XHG3M2-4RJ-SD", full: "XHG3M2-8RJ-E-SD-DTIO2-4TV-4CRJ1CB" },
  "xh-m2l-500": { base: "XHG3M2L-P-SD-3PC", rj4: "XHG3M2L-4RJ-P-SD-3PC", full: "XHG3M2L-8RJ-P-E-SD-DTIO2-3PC-4TV-4CRJ1CB" },
};

describe("logicalRef (golden)", () => {
  it("couvre toutes les gammes du catalogue", () => {
    const catalogIds = catalog.gammes.map((g) => g.id).sort();
    expect(catalogIds).toEqual(Object.keys(EXPECTED).sort());
  });

  for (const gamme of catalog.gammes) {
    for (const [name, options] of Object.entries(SCENARIOS)) {
      it(`${gamme.id} · ${name}`, () => {
        expect(buildLogicalCoffretRef(gamme, grade3, options)).toBe(
          EXPECTED[gamme.id]?.[name]
        );
      });
    }
  }

  it("produit une référence unique par gamme sur un même scénario", () => {
    const refs = catalog.gammes.map((g) =>
      buildLogicalCoffretRef(g, grade3, SCENARIOS.full)
    );
    expect(new Set(refs).size).toBe(refs.length);
  });
});
