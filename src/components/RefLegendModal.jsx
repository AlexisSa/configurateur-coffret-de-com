import { useEffect, useId } from "react";
import { REF_TOKEN_LEGEND } from "../utils/logicalRef.js";

/**
 * @param {{ open: boolean, onClose: () => void }} props
 */
export function RefLegendModal({ open, onClose }) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="confirm-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="confirm-modal-dialog ref-legend-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="confirm-modal-title">
          Légende de la référence
        </h2>
        <p className="confirm-modal-message">
          Format : XHG3{"{Gamme}"}-{"{tokens}"} séparés par des tirets.
        </p>
        <dl className="ref-legend-list">
          {REF_TOKEN_LEGEND.map((item) => (
            <div key={item.token} className="ref-legend-item">
              <dt>
                <code>{item.token}</code>
              </dt>
              <dd>{item.label}</dd>
            </div>
          ))}
        </dl>
        <div className="confirm-modal-actions">
          <button type="button" className="btn primary" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
