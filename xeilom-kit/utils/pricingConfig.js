/**
 * Configuration tarifaire — à personnaliser dans votre projet.
 * Remplace la dépendance au catalogue pour le moteur de prix du kit.
 */

/** @type {{ vatRate: number, disclaimer: string, lot24: { unitSku: string|null, lotSku: string|null, size: number } }} */
export const pricingConfig = {
  vatRate: 0.2,
  disclaimer: "",
  lot24: {
    unitSku: null,
    lotSku: null,
    size: 24,
  },
};

/**
 * @param {Partial<typeof pricingConfig>} overrides
 */
export function configurePricing(overrides) {
  Object.assign(pricingConfig, overrides);
  if (overrides.lot24) {
    Object.assign(pricingConfig.lot24, overrides.lot24);
  }
}
