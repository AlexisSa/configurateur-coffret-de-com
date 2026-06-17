/**
 * Importe les prix HT Oxatis (export CSV) vers pricingMatrix.json.
 * Le CSV source reste local (gitignore) — seul le JSON compilé est versionné.
 *
 * Prérequis : copier config/kit.config.example.mjs → kit.config.mjs à la racine du projet.
 *
 * Usage :
 *   node xeilom-kit/scripts/import-oxatis-pricing.mjs
 *   node xeilom-kit/scripts/import-oxatis-pricing.mjs data/import/mon-export.csv
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  parseOxatisCsv,
  parseOxatisPriceHT,
} from "./lib/parseOxatisCsv.mjs";
import {
  OXATIS_SKU_ALIASES,
  OXATIS_TIER_COLUMNS,
  TIER_CODES,
} from "./lib/oxatisPricingColumns.mjs";

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
const csvArg = process.argv[2];
const csvPath = csvArg ? resolvePath(csvArg) : resolvePath(config.oxatisCsvPath);
const catalogPath = resolvePath(config.catalogPath);
const matrixPath = resolvePath(config.pricingMatrixPath);

const emptyTierPrices = () =>
  Object.fromEntries(TIER_CODES.map((code) => [code, null]));

/**
 * @returns {Record<string, string>}
 */
function buildSkuMap() {
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
  /** @type {Record<string, string>} */
  const map = {};

  for (const gamme of catalog.gammes ?? []) {
    if (!gamme.baseSku) continue;
    map[gamme.baseSku] = gamme.imageSku ?? gamme.baseSku;
  }

  const embase = catalog.components?.embaseRj45;
  if (embase?.sku) {
    map[embase.sku] = embase.sku;
  }

  for (const option of catalog.options ?? []) {
    if (!option.sku) continue;
    map[option.sku] = OXATIS_SKU_ALIASES[option.sku] ?? option.sku;
  }

  return map;
}

/**
 * @param {string[]} header
 * @param {string[][]} rows
 * @returns {Map<string, Record<string, number|null>>}
 */
function indexOxatisPrices(header, rows) {
  const columnIndex = Object.fromEntries(header.map((name, index) => [name, index]));
  const skuIndex = columnIndex.ItemSKU;
  /** @type {Map<string, Record<string, number|null>>} */
  const bySku = new Map();

  for (const row of rows) {
    const itemSku = row[skuIndex]?.trim();
    if (!itemSku) continue;

    const tiers = emptyTierPrices();
    for (const code of TIER_CODES) {
      const column = OXATIS_TIER_COLUMNS[code];
      const value = row[columnIndex[column]];
      tiers[code] = parseOxatisPriceHT(value);
    }

    bySku.set(itemSku.toUpperCase(), tiers);
  }

  return bySku;
}

async function main() {
  if (!existsSync(csvPath)) {
    console.error(`Fichier introuvable : ${csvPath}`);
    console.error("Placez l'export Oxatis (CSV) dans data/import/ puis relancez.");
    process.exit(1);
  }

  const rawBuffer = readFileSync(csvPath);
  let raw = rawBuffer.toString("utf8");
  if (raw.includes("\uFFFD")) {
    raw = rawBuffer.toString("latin1");
  }

  const { header, rows } = parseOxatisCsv(raw);
  const oxatisBySku = indexOxatisPrices(header, rows);
  const configurateurSkus = buildSkuMap();

  /** @type {Record<string, Record<string, number|null>>} */
  const skus = {};
  const missing = [];

  for (const [configSku, oxatisSku] of Object.entries(configurateurSkus)) {
    const tiers =
      oxatisBySku.get(oxatisSku.toUpperCase()) ??
      oxatisBySku.get(configSku.toUpperCase());

    if (!tiers) {
      missing.push(`${configSku} (Oxatis: ${oxatisSku})`);
      skus[configSku] = emptyTierPrices();
      continue;
    }

    skus[configSku] = { ...tiers };
  }

  const output = {
    meta: {
      tiers: TIER_CODES,
      note: "Prix HT par SKU et par tarif. Généré depuis l'export Oxatis (fichier source non versionné).",
      importedFrom: csvPath.split(/[/\\]/).pop(),
      importedAt: new Date().toISOString().slice(0, 10),
      oxatisTierMapping: {
        S: "Tarif 2 (Price2VATExcluded)",
        M: "Tarif 3 (Price3VATExcluded)",
        B: "Tarif 4 (Price4VATExcluded)",
        A: "Tarif 5 (Price5VATExcluded)",
        Z: "Tarif 6 (Price6VATExcluded)",
      },
    },
    skus,
  };

  writeFileSync(matrixPath, `${JSON.stringify(output, null, 2)}\n`);

  const filled = Object.values(skus).filter((tier) =>
    TIER_CODES.every((code) => tier[code] != null)
  ).length;

  console.log(`${matrixPath} mis à jour (${Object.keys(skus).length} SKU).`);
  console.log(`${filled} SKU avec les 5 tarifs complets.`);

  if (missing.length > 0) {
    console.warn("SKU configurateur introuvables dans l'export Oxatis :");
    for (const sku of missing) console.warn(`  - ${sku}`);
  }
}

main();
