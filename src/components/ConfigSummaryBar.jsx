import { ExternalLink, HelpCircle, Share2 } from "lucide-react";
import { formatPriceHT } from "../utils/pricing.js";

const NOT_READY_TITLE = "Ajoutez au moins une option pour continuer";

/**
 * @param {{
 *   configuredRef: string|null,
 *   totalHT: number|null,
 *   isConfigurationReady: boolean,
 *   onPreviewPdf: () => void,
 *   onShare?: () => void,
 *   onOpenLegend: () => void,
 * }} props
 */
export function ConfigSummaryBar({
  configuredRef,
  totalHT,
  isConfigurationReady,
  onPreviewPdf,
  onShare,
  onOpenLegend,
}) {
  if (!configuredRef) return null;

  return (
    <div className="config-summary-bar" aria-label="Résumé de la configuration">
      <div className="config-summary-bar-main">
        <button
          type="button"
          className="config-summary-bar-ref"
          onClick={onOpenLegend}
          title="Voir la légende de la référence"
        >
          <code>{configuredRef}</code>
          <HelpCircle size={14} strokeWidth={2} aria-hidden />
        </button>
        {totalHT != null && (
          <span className="config-summary-bar-total">{formatPriceHT(totalHT)}</span>
        )}
      </div>
      <div className="config-summary-bar-actions">
        <button
          type="button"
          className="btn primary btn-sm"
          onClick={onPreviewPdf}
          disabled={!isConfigurationReady}
          title={!isConfigurationReady ? NOT_READY_TITLE : undefined}
        >
          <ExternalLink size={15} strokeWidth={2} />
          PDF
        </button>
        {onShare && (
          <button
            type="button"
            className="btn ghost btn-sm"
            onClick={onShare}
            disabled={!isConfigurationReady}
            title={!isConfigurationReady ? NOT_READY_TITLE : "Partager"}
            aria-label="Partager la configuration"
          >
            <Share2 size={15} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}
