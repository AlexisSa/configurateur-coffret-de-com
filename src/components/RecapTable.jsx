import { ExternalLink, Eye, Share2 } from "lucide-react";
import { getBomShortDesignation } from "../utils/bomDisplay.js";
import {
  formatPriceHT,
  formatVatLabel,
  getPricedTotalHT,
  getPricingDisclaimer,
  getTotalTTC,
  hasPricedLines,
} from "../utils/pricing.js";

/**
 * @param {{
 *   bom: Array,
 *   hasGamme?: boolean,
 *   optionsStepComplete?: boolean,
 *   onPreviewPdf: () => void,
 *   onShare?: () => void,
 * }} props
 */
export function RecapTable({
  bom,
  hasGamme = false,
  optionsStepComplete = false,
  onPreviewPdf,
  onShare,
}) {
  const lineCount = bom.length;
  const showPrices = hasPricedLines(bom);
  const totalHT = showPrices ? getPricedTotalHT(bom) : 0;
  const pricingDisclaimer = showPrices ? getPricingDisclaimer() : "";

  return (
    <aside className="panel recap-panel" id="recap-panel">
      <div className="recap-header">
        <h2 className="recap-title">Nomenclature</h2>
        {lineCount > 0 && (
          <span className="recap-count">{lineCount}</span>
        )}
      </div>

      {lineCount === 0 ? (
        <p className="recap-empty">
          {!hasGamme
            ? "Choisissez une gamme pour afficher les références."
            : !optionsStepComplete
              ? "Les références apparaîtront ici au fil de la configuration."
              : "La nomenclature se met à jour selon vos choix."}
        </p>
      ) : (
        <>
          <div className="recap-scroll">
            <ul className="bom-list">
              {bom.map((line, index) => (
                <li
                  key={`${line.sku}-${line.type}-${index}`}
                  className="bom-line"
                >
                  <div className="bom-line-body">
                    <div className="bom-line-top">
                      <span className="bom-line-sku">{line.sku}</span>
                      {line.productUrl && (
                        <a
                          className="bom-line-link"
                          href={line.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Fiche produit"
                          aria-label={`Fiche produit ${line.sku}`}
                        >
                          <ExternalLink size={12} strokeWidth={2} />
                        </a>
                      )}
                    </div>
                    <p className="bom-line-desc">
                      {getBomShortDesignation(line)}
                    </p>
                  </div>
                  <div className="bom-line-meta">
                    <span className="bom-line-qty">×{line.quantity}</span>
                    {showPrices && (
                      <span className="bom-line-price">
                        {line.lineTotalHT != null
                          ? formatPriceHT(line.lineTotalHT)
                          : "—"}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="recap-footer">
            {showPrices && (
              <div className="recap-totals">
                <div className="recap-total-line">
                  <span>Total HT</span>
                  <span>{formatPriceHT(totalHT)}</span>
                </div>
                <div className="recap-total-line recap-total-line--highlight">
                  <span>TTC · {formatVatLabel()}</span>
                  <span>{formatPriceHT(getTotalTTC(totalHT))}</span>
                </div>
                {pricingDisclaimer && (
                  <p className="recap-disclaimer">{pricingDisclaimer}</p>
                )}
              </div>
            )}

            <div className="recap-actions">
              <button
                type="button"
                className="btn primary"
                onClick={onPreviewPdf}
              >
                <Eye size={17} strokeWidth={2} />
                Aperçu PDF
              </button>
              {onShare && (
                <button
                  type="button"
                  className="btn ghost recap-share-btn"
                  onClick={onShare}
                  aria-label="Partager la configuration"
                >
                  <Share2 size={17} strokeWidth={2} />
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
