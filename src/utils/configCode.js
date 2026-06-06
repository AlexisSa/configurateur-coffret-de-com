// @ts-check

/**
 * @typedef {import('./compatibility.js').ConfigState & { internal?: import('./compatibility.js').ConfigState['internal'] }} FullState
 */

const VERSION = "1";
export const MAX_CONFIG_PARAM_LENGTH = 4096;

/**
 * @param {Uint8Array} bytes
 */
function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

/**
 * @param {string} text
 */
function encodeUtf8ToBase64Url(text) {
  return bytesToBase64Url(new TextEncoder().encode(text));
}

/**
 * @param {string} code
 */
function decodeBase64UrlToUtf8(code) {
  let base64 = code.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  if (pad) base64 += "=".repeat(4 - pad);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * @param {string} code
 */
function decodeLegacyBase64ToUtf8(code) {
  return decodeURIComponent(escape(atob(code.trim())));
}

/**
 * @param {Object} payload
 */
export function encodeConfig(payload) {
  const json = JSON.stringify({ v: VERSION, ...payload });
  return encodeUtf8ToBase64Url(json);
}

/**
 * @param {string} code
 * @returns {Object|null}
 */
export function decodeConfig(code) {
  if (!code?.trim()) return null;
  if (code.length > MAX_CONFIG_PARAM_LENGTH) return null;

  const trimmed = code.trim();

  try {
    const json = decodeBase64UrlToUtf8(trimmed);
    const data = JSON.parse(json);
    if (data.v === VERSION) return data;
  } catch {
    // format base64url ou standard
  }

  try {
    const json = decodeLegacyBase64ToUtf8(trimmed);
    const data = JSON.parse(json);
    if (data.v === VERSION) return data;
  } catch {
    // lien invalide
  }

  return null;
}

/**
 * @param {import('./compatibility.js').ConfigState} state
 */
export function generateConfigCode(state) {
  const gamme = state.gammeId?.replace(/^coffret-/, "").toUpperCase() ?? "???";
  const mat = state.materiau?.toUpperCase().slice(0, 3) ?? "???";
  const opts = Object.entries(state.options)
    .filter(([, v]) => v)
    .map(([g, id]) => {
      const short = id.split("-").pop()?.toUpperCase() ?? id;
      return `${g}:${short}`;
    })
    .join("|");

  const qty =
    state.coffretCount && state.coffretCount > 1 ? `QTY:${state.coffretCount}` : "";
  const readable = [`COF-${gamme}`, mat, qty, opts].filter(Boolean).join("|");
  return readable;
}

/**
 * Construit un lien de partage de la configuration produit.
 * Les coordonnées client (internal) sont volontairement exclues : un lien
 * partagé ne doit pas divulguer le nom, l'email ou le téléphone du client.
 * @param {import('./compatibility.js').ConfigState} state
 */
export function buildShareUrl(state) {
  const encoded = encodeConfig({
    gammeId: state.gammeId,
    materiau: state.materiau,
    coffretCount: state.coffretCount,
    options: state.options,
  });
  const url = new URL(window.location.href);
  url.searchParams.set("config", encoded);
  return url.toString();
}

/**
 * @returns {Object|null}
 */
export function loadConfigFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get("config");
  if (!encoded) return null;
  return decodeConfig(encoded);
}

/**
 * Encodage legacy (rétrocompatibilité tests).
 * @param {Object} payload
 */
export function encodeConfigLegacy(payload) {
  const json = JSON.stringify({ v: VERSION, ...payload });
  return btoa(unescape(encodeURIComponent(json)));
}
