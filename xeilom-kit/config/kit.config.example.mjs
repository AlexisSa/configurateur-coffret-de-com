/**
 * Copiez ce fichier en `kit.config.mjs` à la racine de votre projet
 * et adaptez les chemins avant d'exécuter les scripts d'import tarifs.
 */
export const kitConfig = {
  /** Dossier racine du projet hôte (généralement process.cwd()). */
  projectRoot: process.cwd(),

  /** Export CSV Oxatis (gitignore — ne pas versionner). */
  oxatisCsvPath: "data/import/Oxatis-All-xeilom-26993.csv",

  /** Catalogue produit (liste des SKU à tarifer). */
  catalogPath: "src/data/catalog.json",

  /** Matrice tarifaire générée (versionnée). */
  pricingMatrixPath: "src/data/pricingMatrix.json",

  /** Mapping catégories Oxatis → codes tarif. */
  pricingTiersPath: "src/data/pricingTiers.json",
};
