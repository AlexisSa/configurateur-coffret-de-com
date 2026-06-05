/**
 * @typedef {import('./compatibility.js').ConfigState & { internal?: import('./compatibility.js').ConfigState['internal'] }} FullState
 */

const VERSION = "1";

/**
 * @param {Object} payload
 */
export function encodeConfig(payload) {
  const json = JSON.stringify({ v: VERSION, ...payload });
  return btoa(unescape(encodeURIComponent(json)));
}

/**
 * @param {string} code
 * @returns {Object|null}
 */
export function decodeConfig(code) {
  if (!code?.trim()) return null;
  try {
    const json = decodeURIComponent(escape(atob(code.trim())));
    const data = JSON.parse(json);
    if (data.v !== VERSION) return null;
    return data;
  } catch {
    return null;
  }
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
