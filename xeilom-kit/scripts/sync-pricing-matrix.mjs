/**
 * Synchronise les prix S de pricingMatrix.json depuis catalog.json.
 * Conserve les tarifs M/B/A/Z déjà renseignés.
 *
 * Usage : node xeilom-kit/scripts/sync-pricing-matrix.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const kitRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const projectRoot = process.cwd();

/** @type {import('../config/kit.config.example.mjs').kitConfig} */
let config;
try {
  ({ kitConfig: config } = await import(join(projectRoot, "kit.config.mjs")));
} catch {
  ({ kitConfig: config } = await import(
    join(kitRoot, "config/kit.config.example.mjs")
  ));
}

const resolvePath = (relativePath) => join(projectRoot, relativePath);
const catalog = JSON.parse(readFileSync(resolvePath(config.catalogPath), "utf8"));
const matrixPath = resolvePath(config.pricingMatrixPath);

const TIER_CODES = ["S", "M", "B", "A", "Z"];
const emptyTierPrices = () =>
  Object.fromEntries(TIER_CODES.map((code) => [code, null]));

/** @type {Record<string, Record<string, number|null>>} */
const skus = {};

function setSkuPrice(sku, priceS) {
  if (!sku) return;
  const existing = skus[sku] ?? emptyTierPrices();
  existing.S = typeof priceS === "number" ? priceS : existing.S ?? null;
  skus[sku] = existing;
}

for (const gamme of catalog.gammes ?? []) {
  if (gamme.baseSku && gamme.unitPriceHT != null) {
    setSkuPrice(gamme.baseSku, gamme.unitPriceHT);
    for (const materiau of gamme.materiaux ?? []) {
      setSkuPrice(gamme.baseSku + (materiau.skuSuffix ?? ""), gamme.unitPriceHT);
    }
  }
}

const embase = catalog.components?.embaseRj45;
if (embase?.sku && embase.unitPriceHT != null) {
  setSkuPrice(embase.sku, embase.unitPriceHT);
}

for (const option of catalog.options ?? []) {
  if (option.sku) {
    setSkuPrice(option.sku, option.unitPriceHT ?? null);
  }
}

let previous = { skus: {} };
try {
  previous = JSON.parse(readFileSync(matrixPath, "utf8"));
} catch {
  // premier run
}

for (const [sku, tiers] of Object.entries(previous.skus ?? {})) {
  if (!skus[sku]) skus[sku] = emptyTierPrices();
  for (const code of TIER_CODES) {
    if (code === "S") continue;
    if (tiers?.[code] != null) skus[sku][code] = tiers[code];
  }
}

const output = {
  meta: {
    tiers: TIER_CODES,
    note: "Prix HT par SKU et par tarif. S = particulier/public. null = tarif non renseigné.",
    syncedFromCatalog: new Date().toISOString().slice(0, 10),
  },
  skus,
};

writeFileSync(matrixPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`${matrixPath} mis à jour (${Object.keys(skus).length} SKU).`);
