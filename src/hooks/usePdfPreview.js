import { useState, useEffect, useCallback, useRef } from "react";
import {
  createBomPdfBlob,
  downloadBomPdf,
} from "../utils/pdfGenerator.js";

/**
 * @param {{
 *   state: import('../utils/compatibility.js').ConfigState,
 *   internal: { clientName?: string, societe?: string, email?: string, telephone?: string },
 *   pricingTierCode: string,
 *   addToast: (type: string, title: string, message: string) => void,
 * }} params
 */
export function usePdfPreview({ state, internal, pricingTierCode, addToast }) {
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const pdfPreviewUrlRef = useRef(null);

  const revokePdfPreviewUrl = useCallback(() => {
    if (pdfPreviewUrlRef.current) {
      URL.revokeObjectURL(pdfPreviewUrlRef.current);
      pdfPreviewUrlRef.current = null;
    }
    setPdfPreviewUrl(null);
  }, []);

  useEffect(() => () => revokePdfPreviewUrl(), [revokePdfPreviewUrl]);

  const openPdfPreview = useCallback(async () => {
    const blob = await createBomPdfBlob(state, internal, pricingTierCode);
    if (!blob) {
      addToast("error", "Erreur", "Sélectionnez une gamme");
      return;
    }
    revokePdfPreviewUrl();
    const url = URL.createObjectURL(blob);
    pdfPreviewUrlRef.current = url;
    setPdfPreviewUrl(url);
  }, [state, internal, pricingTierCode, addToast, revokePdfPreviewUrl]);

  const closePdfPreview = useCallback(() => {
    revokePdfPreviewUrl();
  }, [revokePdfPreviewUrl]);

  const downloadPdf = useCallback(async () => {
    const ok = await downloadBomPdf(state, internal, pricingTierCode);
    if (ok) addToast("success", "PDF téléchargé", "");
    else addToast("error", "Erreur", "Sélectionnez une gamme");
  }, [state, internal, pricingTierCode, addToast]);

  return {
    pdfPreviewUrl,
    openPdfPreview,
    closePdfPreview,
    downloadPdf,
  };
}
