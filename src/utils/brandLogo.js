/** URL publique du logo (dossier `public/brand/`). */
export const BRAND_LOGO_URL = `${import.meta.env.BASE_URL}brand/logo.webp`;

/** @typedef {{ dataUrl: string, width: number, height: number }} BrandLogoAsset */

/** @type {BrandLogoAsset | null | undefined} */
let cachedLogo;

/**
 * Charge le logo pour jsPDF (WebP → PNG via canvas).
 * @returns {Promise<BrandLogoAsset | null>}
 */
export async function loadBrandLogoForPdf() {
  if (cachedLogo !== undefined) return cachedLogo;

  try {
    const response = await fetch(BRAND_LOGO_URL);
    if (!response.ok) {
      cachedLogo = null;
      return null;
    }

    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      cachedLogo = null;
      return null;
    }

    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    cachedLogo = {
      dataUrl: canvas.toDataURL("image/png"),
      width: canvas.width,
      height: canvas.height,
    };
    return cachedLogo;
  } catch {
    cachedLogo = null;
    return null;
  }
}
