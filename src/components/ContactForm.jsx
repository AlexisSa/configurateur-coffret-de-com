import { useId, useState } from "react";
import { ClipboardCopy, Mail } from "lucide-react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @param {string} email
 * @returns {boolean}
 */
function isEmailValid(email) {
  return EMAIL_PATTERN.test(email.trim());
}

/**
 * @param {string} phone
 * @returns {boolean}
 */
function isPhoneValid(phone) {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10;
}

/**
 * @param {Object} props
 */
export function ContactForm({
  internal,
  updateInternal,
  buildMailtoLink,
  onCopyRecap,
}) {
  const emailErrorId = useId();
  const phoneErrorId = useId();
  const [touched, setTouched] = useState({
    email: false,
    telephone: false,
  });

  const nameFilled = internal.clientName.trim().length > 0;
  const societeFilled = internal.societe.trim().length > 0;
  const emailFilled = internal.email.trim().length > 0;
  const emailValid = emailFilled && isEmailValid(internal.email);
  const phoneFilled = internal.telephone.trim().length > 0;
  const phoneValid = phoneFilled && isPhoneValid(internal.telephone);

  const showEmailError = touched.email && emailFilled && !emailValid;
  const showPhoneError = touched.telephone && phoneFilled && !phoneValid;
  const canSend = nameFilled && societeFilled && emailValid && phoneValid;

  const handleSendEmail = () => {
    const mailtoUrl = buildMailtoLink();
    const target = window.top ?? window;
    target.location.href = mailtoUrl;
  };

  return (
    <section className="panel" id="contact-form">
      <div className="panel-header">
        <h2 className="section-title">Demande de devis</h2>
      </div>
      <div className="form-grid">
        <label>
          Nom complet
          <input
            type="text"
            value={internal.clientName}
            onChange={(e) => updateInternal("clientName", e.target.value)}
            autoComplete="name"
            required
          />
        </label>
        <label>
          Société
          <input
            type="text"
            value={internal.societe}
            onChange={(e) => updateInternal("societe", e.target.value)}
            autoComplete="organization"
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={internal.email}
            onChange={(e) => updateInternal("email", e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
            autoComplete="email"
            aria-invalid={showEmailError}
            aria-describedby={showEmailError ? emailErrorId : undefined}
            className={showEmailError ? "invalid" : undefined}
            required
          />
          {showEmailError && (
            <span id={emailErrorId} className="field-error">
              Adresse email invalide
            </span>
          )}
        </label>
        <label>
          Téléphone
          <input
            type="tel"
            value={internal.telephone}
            onChange={(e) => updateInternal("telephone", e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, telephone: true }))}
            autoComplete="tel"
            aria-invalid={showPhoneError}
            aria-describedby={showPhoneError ? phoneErrorId : undefined}
            className={showPhoneError ? "invalid" : undefined}
            required
          />
          {showPhoneError && (
            <span id={phoneErrorId} className="field-error">
              Numéro de téléphone invalide
            </span>
          )}
        </label>
        <label className="form-grid-full">
          Commentaire
          <textarea
            value={internal.commentaire}
            onChange={(e) => updateInternal("commentaire", e.target.value)}
            rows={4}
            placeholder="Précisions sur le projet, contraintes d'installation, délais souhaités…"
          />
        </label>
      </div>

      <div className="form-actions">
        {canSend ? (
          <button type="button" className="btn primary" onClick={handleSendEmail}>
            <Mail size={18} strokeWidth={2} />
            Envoyer par email
          </button>
        ) : (
          <button
            type="button"
            className="btn primary"
            disabled
            title="Renseignez tous les champs obligatoires pour envoyer la demande"
          >
            <Mail size={18} strokeWidth={2} />
            Envoyer par email
          </button>
        )}
        {onCopyRecap && (
          <button type="button" className="btn ghost" onClick={onCopyRecap}>
            <ClipboardCopy size={18} strokeWidth={2} />
            Copier le récapitulatif
          </button>
        )}
      </div>
    </section>
  );
}
