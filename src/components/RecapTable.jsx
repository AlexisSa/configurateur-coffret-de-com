import { useState } from "react";
import { ExternalLink, HelpCircle, RotateCcw, Share2 } from "lucide-react";
import { ConfirmModal } from "./ConfirmModal.jsx";
import { RefApplyField } from "./RefApplyField.jsx";
import { getBomShortDesignation, getConfiguredCoffretRef } from "../utils/bomDisplay.js";
import { getOrderPricingLines } from "../utils/orderPricing.js";
import { formatPriceHT, getPricingDisclaimer, hasPricedLines } from "../utils/pricing.js";
import { normalizeCoffretCount, DEFAULT_COFFRET_COUNT } from "../utils/coffretQuantity.js";

const NOT_READY_TITLE = "Ajoutez au moins une option pour continuer";

/**
 * @param {{
 *   bom: Array,
 *   coffretCount?: number,
 *   pricingTierCode?: string,
 *   pricingTierLabel?: string,
 *   pricingTierPending?: boolean,
 *   hasGamme?: boolean,
 *   optionsStepComplete?: boolean,
 *   isConfigurationReady?: boolean,
 *   onPreviewPdf: () => void,
 *   onShare?: () => void,
 *   onApplyRef?: (ref: string) => void,
 *   onOpenLegend?: () => void,
 *   onReset?: () => void,
 * }} props
 */
export function RecapTable({
  bom,
  coffretCount = DEFAULT_COFFRET_COUNT,
  pricingTierCode,
  pricingTierLabel,
  pricingTierPending = false,
  hasGamme = false,
  optionsStepComplete = false,
  isConfigurationReady = false,
  onPreviewPdf,
  onShare,
  onApplyRef,
  onOpenLegend,
  onReset,
}) {
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const lineCount = bom.length;
  const showPrices = hasPricedLines(bom);
  const normalizedCount = normalizeCoffretCount(coffretCount);
  const pricingLines = showPrices
    ? getOrderPricingLines(bom, normalizedCount)
    : [];
  const pricingDisclaimer = showPrices ? getPricingDisclaimer(pricingTierCode) : "";
  const configuredRef = getConfiguredCoffretRef(bom);

  return (
    <aside className="panel recap-panel" id="recap-panel">
      <div className="recap-header">
        <h2 className="recap-title">Nomenclature</h2>
        {hasGamme && onReset && (
          <button
            type="button"
            className="link-btn recap-reset-btn"
            onClick={() => setConfirmResetOpen(true)}
            aria-label="Réinitialiser la configuration"
          >
            <RotateCcw size={13} strokeWidth={2} aria-hidden />
            Réinitialiser
          </button>
        )}
      </div>

      <ConfirmModal
        open={confirmResetOpen}
        title="Réinitialiser la configuration ?"
        message="Tous vos choix seront effacés. Vous devrez recommencer depuis le début."
        confirmLabel="Réinitialiser"
        onConfirm={() => {
          onReset?.();
          setConfirmResetOpen(false);
        }}
        onCancel={() => setConfirmResetOpen(false)}
      />

      {lineCount === 0 ? (
        <p className="recap-empty">
          {!hasGamme
            ? "Choisissez une gamme ou chargez une référence ci-dessous."
            : !optionsStepComplete
              ? "Les références apparaîtront ici au fil de la configuration."
              : "La nomenclature se met à jour selon vos choix."}
        </p>
      ) : (
        <>
          {configuredRef && (
            <div className="recap-config-ref">
              <div className="recap-config-ref-head">
                <span className="recap-config-ref-label">Référence configurée</span>
                {onOpenLegend && (
                  <button
                    type="button"
                    className="link-btn recap-ref-legend-btn"
                    onClick={onOpenLegend}
                    aria-label="Légende de la référence"
                  >
                    <HelpCircle size={14} strokeWidth={2} />
                  </button>
                )}
              </div>
              <code className="recap-config-ref-value">{configuredRef}</code>
            </div>
          )}

          {(pricingTierLabel || pricingTierPending) && (
            <p className="recap-tier-label">
              {pricingTierPending
                ? "Tarif en chargement…"
                : `Grille tarifaire : ${pricingTierLabel}`}
            </p>
          )}

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
                {pricingLines.map((line) => (
                  <div
                    key={line.label}
                    className={
                      line.highlight
                        ? "recap-total-line recap-total-line--highlight"
                        : "recap-total-line"
                    }
                  >
                    <span>{line.label}</span>
                    <span>{formatPriceHT(line.amount)}</span>
                  </div>
                ))}
                <p className="recap-coffret-reminder">
                  Devis pour <strong>{normalizedCount}</strong> coffret
                  {normalizedCount > 1 ? "s" : ""}
                </p>
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
                disabled={!isConfigurationReady}
                title={!isConfigurationReady ? NOT_READY_TITLE : undefined}
              >
                <ExternalLink size={17} strokeWidth={2} />
                Voir le PDF
              </button>
              {onShare && (
                <button
                  type="button"
                  className="btn ghost recap-share-btn"
                  onClick={onShare}
                  disabled={!isConfigurationReady}
                  title={!isConfigurationReady ? NOT_READY_TITLE : "Partager la configuration"}
                  aria-label="Partager la configuration"
                >
                  <Share2 size={17} strokeWidth={2} />
                  Partager
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {onApplyRef && <RefApplyField onApply={onApplyRef} />}
    </aside>
  );
}
