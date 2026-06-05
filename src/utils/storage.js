const STORAGE_KEY = "coffret-config-v1";

/**
 * Lit la dernière configuration sauvegardée localement.
 * @returns {Object|null}
 */
export function loadStoredConfig() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Persiste la configuration courante (échec silencieux si quota/indisponible).
 * @param {Object} payload
 */
export function saveStoredConfig(payload) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage indisponible (mode privé, quota) : on ignore.
  }
}

/**
 * Efface la configuration sauvegardée localement.
 */
export function clearStoredConfig() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage indisponible : on ignore.
  }
}
