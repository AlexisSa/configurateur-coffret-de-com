/** @typedef {{ dataUrl: string, width: number, height: number }} PdfImageAsset */

/** @type {Map<string, PdfImageAsset | null>} */
const cache = new Map();

/**
 * Convertit un blob image en asset PNG pour jsPDF.
 * @param {Blob} blob
 * @returns {Promise<PdfImageAsset | null>}
 */
async function blobToPdfAsset(blob) {
  try {
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return null;
    }

    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    return {
      dataUrl: canvas.toDataURL("image/png"),
      width: canvas.width,
      height: canvas.height,
    };
  } catch {
    return null;
  }
}

/**
 * Charge une image produit (locale puis CDN Xeilom) pour jsPDF.
 * @param {string} [image]
 * @param {string} [imageSource]
 * @returns {Promise<PdfImageAsset | null>}
 */
export async function loadProductImageForPdf(image, imageSource) {
  const cacheKey = `${image ?? ""}|${imageSource ?? ""}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey) ?? null;

  const urls = [image, imageSource].filter(Boolean);
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const asset = await blobToPdfAsset(await response.blob());
      if (asset) {
        cache.set(cacheKey, asset);
        return asset;
      }
    } catch {
      // Essai de l’URL suivante
    }
  }

  cache.set(cacheKey, null);
  return null;
}
