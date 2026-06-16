import { useCallback } from "react";
import { createBomPdfBlob } from "../utils/pdfGenerator.js";

/** Délai avant révocation de l’URL blob (le nouvel onglet doit finir de charger). */
const BLOB_REVOKE_MS = 60_000;

/**
 * @param {Blob} blob
 */
function downloadPdfBlob(blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "devis-coffret.pdf";
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), BLOB_REVOKE_MS);
}

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
    const blob = await createBomPdfBlob(state, internal, pricingTierCode);
    if (!blob) {
      addToast("error", "Erreur", "Sélectionnez une gamme");
      return;
    }

    const url = URL.createObjectURL(blob);
    const tab = window.open(url, "_blank", "noopener,noreferrer");
    if (tab) {
      window.setTimeout(() => URL.revokeObjectURL(url), BLOB_REVOKE_MS);
      return;
    }

    URL.revokeObjectURL(url);
    try {
      downloadPdfBlob(blob);
      addToast(
        "success",
        "PDF téléchargé",
        "Le fichier a été enregistré sur votre appareil."
      );
    } catch {
      addToast(
        "error",
        "Ouverture bloquée",
        "Autorisez les fenêtres contextuelles ou le téléchargement pour obtenir le PDF."
      );
    }
  }, [state, internal, pricingTierCode, addToast]);

  return { openPdfPreview };
}
