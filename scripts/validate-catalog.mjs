#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(
  readFileSync(join(root, "src/data/catalog.json"), "utf8")
);
const pricingMatrix = JSON.parse(
  readFileSync(join(root, "src/data/pricingMatrix.json"), "utf8")
);

const BRASSAGE_EXTERIEUR = "brassage-exterieur";
const grade3 = { skuSuffix: "" };
const errors = [];
const warnings = [];

/**
 * @param {{ imageSku?: string }} gamme
 */
function getStaticRefSuffixFromImageSku(gamme) {
  const imageSku = gamme?.imageSku;
  if (!imageSku) return "";
  const match = imageSku.match(/^[^-]+-\d+RJ(.*)$/);
  return match?.[1] ?? "";
}

/**
 * @param {typeof catalog.gammes[0]} gamme
 * @param {Record<string, string>} options
 */
function getChassisPricingSku(gamme, options = {}) {
  if (!gamme?.baseSku) return "";
  let suffix = grade3.skuSuffix ?? "";
  const brassageId = options.brassage;
  if (brassageId) {
    const option = catalog.options.find((o) => o.id === brassageId);
    suffix += option?.rules?.chassisSkuSuffix ?? "";
  }
  return gamme.baseSku + suffix;
}

for (const gamme of catalog.gammes) {
  if (!gamme.baseSku) {
    errors.push(`${gamme.id} : baseSku manquant`);
  }
  if (!gamme.imageSku) {
    errors.push(`${gamme.id} : imageSku manquant`);
  }

  const porteIncluded = gamme.attributes?.porteMode === "included";
  const refHasPorte = getStaticRefSuffixFromImageSku(gamme).endsWith("P");
  if (porteIncluded && !refHasPorte) {
    warnings.push(
      `${gamme.id} : porteMode=included mais imageSku sans « P » (${gamme.imageSku})`
    );
  }

  for (const brassage of ["", BRASSAGE_EXTERIEUR]) {
    if (brassage === BRASSAGE_EXTERIEUR) {
      const hasBrassageGroup = gamme.specificOptionGroups?.includes("brassage");
      if (!hasBrassageGroup) continue;
    }
    const sku = getChassisPricingSku(gamme, { brassage });
    if (!sku) continue;
    if (!pricingMatrix.skus?.[sku]) {
      errors.push(`${gamme.id} : SKU tarifaire absent de pricingMatrix (${sku})`);
    }
  }
}

if (warnings.length > 0) {
  console.warn("Avertissements catalogue :\n" + warnings.map((w) => `  - ${w}`).join("\n"));
}

if (errors.length > 0) {
  console.error("Erreurs catalogue :\n" + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}

console.log(
  `Catalogue OK (${catalog.gammes.length} gammes, ${warnings.length} avertissement(s)).`
);
