import { useEffect, useId } from "react";
import { FileDown, X } from "lucide-react";

/**
 * Modale d’aperçu PDF (iframe + téléchargement).
 * @param {{
 *   open: boolean,
 *   url: string | null,
 *   onClose: () => void,
 *   onDownload: () => void,
 * }} props
 */
export function PdfPreviewModal({ open, url, onClose, onDownload }) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !url) return null;

  return (
    <div
      className="pdf-preview-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="pdf-preview-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="pdf-preview-header">
          <div className="pdf-preview-header-text">
            <h2 id={titleId} className="pdf-preview-title">
              Aperçu nomenclature
            </h2>
            <p className="pdf-preview-subtitle">
              Document PDF généré depuis votre configuration
            </p>
          </div>
          <button
            type="button"
            className="pdf-preview-close"
            onClick={onClose}
            aria-label="Fermer l’aperçu"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </header>

        <div className="pdf-preview-body">
          <div className="pdf-preview-paper">
            <iframe
              className="pdf-preview-frame"
              src={url}
              title="Aperçu de la nomenclature PDF"
            />
          </div>
        </div>

        <footer className="pdf-preview-footer">
          <span className="pdf-preview-footer-hint">
            Format A4 · Prêt à partager ou imprimer
          </span>
          <div className="pdf-preview-footer-actions">
            <button type="button" className="btn ghost" onClick={onClose}>
              Fermer
            </button>
            <button type="button" className="btn primary" onClick={onDownload}>
              <FileDown size={18} strokeWidth={2} />
              Télécharger
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
