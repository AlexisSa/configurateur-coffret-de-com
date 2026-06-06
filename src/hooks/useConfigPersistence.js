import { useEffect, useRef } from "react";
import { saveStoredConfig } from "../utils/storage.js";

const DEBOUNCE_MS = 400;

/**
 * Persiste la configuration produit et les coordonnées client avec debounce.
 * @param {{
 *   gammeId: string,
 *   materiau: string,
 *   coffretCount: number,
 *   options: Record<string, string>,
 *   internal: { clientName: string, societe: string, email: string, telephone: string, commentaire: string },
 * }} payload
 */
export function useConfigPersistence({
  gammeId,
  materiau,
  coffretCount,
  options,
  internal,
}) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!gammeId) return undefined;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveStoredConfig({
        gammeId,
        materiau,
        coffretCount,
        options,
        internal,
      });
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gammeId, materiau, coffretCount, options, internal]);
}
