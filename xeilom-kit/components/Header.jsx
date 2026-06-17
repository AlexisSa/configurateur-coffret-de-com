import { BRAND_LOGO_URL } from "../utils/brandLogo.js";

/**
 * @param {{
 *   eyebrow?: string,
 *   title?: string,
 *   logoAlt?: string,
 * }} [props]
 */
export function Header({
  eyebrow = "XH'system · Grade 3 TV",
  title = "Configurateur",
  logoAlt = "Xeilom",
}) {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-brand">
          <img
            className="header-logo"
            src={BRAND_LOGO_URL}
            alt={logoAlt}
            width={140}
            height={34}
          />
        </div>

        <div className="header-divider" aria-hidden />

        <div className="header-product">
          <p className="header-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </div>
      </div>
    </header>
  );
}
