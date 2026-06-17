/** Palette PDF alignée sur les tokens CSS Xeilom (--brand, etc.). */
export const PDF_COLORS = {
  brand: { r: 54, g: 59, b: 199 },
  brandDark: { r: 43, g: 47, b: 159 },
  accent: { r: 24, g: 24, b: 27 },
  text: { r: 24, g: 24, b: 27 },
  muted: { r: 113, g: 113, b: 122 },
  subtle: { r: 161, g: 161, b: 170 },
  border: { r: 228, g: 228, b: 231 },
  surface: { r: 250, g: 250, b: 251 },
  rowAlt: { r: 247, g: 247, b: 248 },
  skuBg: { r: 243, g: 244, b: 246 },
  white: { r: 255, g: 255, b: 255 },
};

/**
 * Prix lisibles par jsPDF (pas d'espace fine Unicode d'Intl).
 * @param {number|null|undefined} amount
 */
export function formatPdfPrice(amount) {
  if (amount == null) return "—";
  const [intPart, decPart] = amount.toFixed(2).split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${grouped},${decPart} €`;
}
