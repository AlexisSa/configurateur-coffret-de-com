import { buildShareUrl } from "./configCode.js";
import { buildStructuredQuoteBody } from "./quoteFormat.js";

const MAX_MAILTO_BODY_ENCODED = 1800;
const MAILTO_RECIPIENT = "commercial@xeilom.fr";

const MAIL_INTRO = [
  "Bonjour,",
  "",
  "Demande de devis transmise depuis le configurateur XH'system.",
].join("\n");

const MAIL_OUTRO = "Cordialement";

/**
 * @param {{
 *   state: import('./compatibility.js').ConfigState,
 *   internal: { clientName?: string, societe?: string, email?: string, telephone?: string, commentaire?: string },
 *   bom: import('./bomBuilder.js').BomLine[],
 *   pricingTierCode: string,
 *   configCode: string,
 * }} params
 */
export function buildMailtoLink({ state, internal, bom, pricingTierCode, configCode }) {
  const subject = encodeURIComponent(`Devis coffret — ${configCode}`);

  const fullBody = [
    MAIL_INTRO,
    buildStructuredQuoteBody({
      state,
      internal,
      bom,
      pricingTierCode,
      mode: "full",
    }),
    "",
    MAIL_OUTRO,
  ].join("\n");

  let body = fullBody;
  if (encodeURIComponent(fullBody).length > MAX_MAILTO_BODY_ENCODED) {
    body = [
      MAIL_INTRO,
      buildStructuredQuoteBody({
        state,
        internal,
        bom,
        pricingTierCode,
        mode: "short",
        shareUrl: buildShareUrl(state),
      }),
      "",
      MAIL_OUTRO,
    ].join("\n");
  }

  return `mailto:${MAILTO_RECIPIENT}?subject=${subject}&body=${encodeURIComponent(body)}`;
}
