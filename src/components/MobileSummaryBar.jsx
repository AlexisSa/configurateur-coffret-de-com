import { Eye, Mail, Share2 } from "lucide-react";
import {
  formatPriceHT,
  getPricedTotalHT,
  hasPricedLines,
} from "../utils/pricing.js";

/**
 * Barre récap collante en bas d'écran (mobile uniquement, via CSS).
 * @param {{
 *   bom: Array,
 *   showContactCta?: boolean,
 *   onScrollToContact?: () => void,
 *   onPreviewPdf: () => void,
 *   onShare?: () => void,
 * }} props
 */
export function MobileSummaryBar({
  bom,
  showContactCta = false,
  onScrollToContact,
  onPreviewPdf,
  onShare,
}) {
  if (!bom.length) return null;

  const showPrices = hasPricedLines(bom);
  const totalHT = showPrices ? getPricedTotalHT(bom) : null;

  return (
    <div className="mobile-summary-bar" role="region" aria-label="Récapitulatif">
      <div className="mobile-summary-total">
        <span className="mobile-summary-label">Total HT estimé</span>
        <strong className="mobile-summary-value">
          {totalHT != null ? formatPriceHT(totalHT) : `${bom.length} lignes`}
        </strong>
      </div>
      <div className="mobile-summary-actions">
        {showContactCta && onScrollToContact && (
          <button
            type="button"
            className="btn primary mobile-summary-devis"
            onClick={onScrollToContact}
          >
            <Mail size={16} strokeWidth={2} />
            Devis
          </button>
        )}
        {onShare && (
          <button
            type="button"
            className="btn ghost"
            onClick={onShare}
            aria-label="Partager la configuration"
          >
            <Share2 size={18} strokeWidth={2} />
          </button>
        )}
        <button
          type="button"
          className="btn ghost"
          onClick={onPreviewPdf}
          aria-label="Aperçu PDF"
        >
          <Eye size={18} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
