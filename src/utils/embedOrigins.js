export const EMBED_PARENT_ORIGINS = [
  "https://www.xeilom.fr",
  "https://xeilom.fr",
];

/**
 * @returns {string[]}
 */
export function getAllowedEmbedOrigins() {
  const origins = new Set(EMBED_PARENT_ORIGINS);

  try {
    if (document.referrer) {
      origins.add(new URL(document.referrer).origin);
    }
  } catch {
    // referrer invalide
  }

  return [...origins];
}

/**
 * @param {string} origin
 * @returns {boolean}
 */
export function isAllowedEmbedOrigin(origin) {
  if (import.meta.env.DEV) return true;
  return getAllowedEmbedOrigins().includes(origin);
}
