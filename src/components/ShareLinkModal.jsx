import { useEffect, useId, useRef } from "react";
import { ClipboardCopy } from "lucide-react";
import { copyTextToClipboard } from "../utils/clipboard.js";

/**
 * Affiche le lien de partage quand la copie automatique est bloquée (iframe).
 * @param {{
 *   open: boolean,
 *   url: string,
 *   onClose: () => void,
 *   onCopied?: () => void,
 * }} props
 */
export function ShareLinkModal({ open, url, onClose, onCopied }) {
  const titleId = useId();
  const inputId = useId();
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    inputRef.current?.focus();
    inputRef.current?.select();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleCopy = async () => {
    const copied = await copyTextToClipboard(url);
    if (copied) {
      onCopied?.();
      onClose();
    }
  };

  return (
    <div className="confirm-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="confirm-modal-dialog share-link-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="confirm-modal-title">
          Partager la configuration
        </h2>
        <p className="confirm-modal-message">
          Copiez ce lien pour le partager. Il ouvre la configuration sur le site Xeilom.
        </p>
        <input
          ref={inputRef}
          id={inputId}
          className="share-link-input"
          type="text"
          readOnly
          value={url}
          onFocus={(event) => event.target.select()}
        />
        <div className="confirm-modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Fermer
          </button>
          <button type="button" className="btn primary" onClick={handleCopy}>
            <ClipboardCopy size={17} strokeWidth={2} />
            Copier le lien
          </button>
        </div>
      </div>
    </div>
  );
}
