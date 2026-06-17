import { useCallback } from "react";
import { createBomPdfBlob } from "../utils/pdfGenerator.js";

/** Délai avant révocation de l’URL blob (le nouvel onglet doit finir de charger). */
const BLOB_REVOKE_MS = 60_000;

/**
 * @param {{
 *   state: import('../utils/compatibility.js').ConfigState,
 *   internal: { clientName?: string, societe?: string, email?: string, telephone?: string },
 *   pricingTierCode: string,
 *   addToast: (type: string, title: string, message: string) => void,
 * }} params
 */
export function usePdfPreview({ state, internal, pricingTierCode, addToast }) {
  const openPdfPreview = useCallback(async () => {
    try {
      const blob = await createBomPdfBlob(state, internal, pricingTierCode);
      if (!blob) {
        addToast("error", "Erreur", "Impossible de générer le PDF.");
        return;
      }

      const url = URL.createObjectURL(blob);
      const tab = window.open(url, "_blank", "noopener,noreferrer");
      if (!tab) {
        URL.revokeObjectURL(url);
        addToast(
          "error",
          "Ouverture bloquée",
          "Autorisez les fenêtres contextuelles pour afficher le PDF."
        );
        return;
      }

      window.setTimeout(() => URL.revokeObjectURL(url), BLOB_REVOKE_MS);
    } catch {
      addToast(
        "error",
        "Erreur PDF",
        "La génération du document a échoué. Réessayez dans un instant."
      );
    }
  }, [state, internal, pricingTierCode, addToast]);

  return { openPdfPreview };
}
