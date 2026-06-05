import { BRAND_LOGO_URL } from "../utils/brandLogo.js";

export function Header() {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-brand">
          <img
            className="header-logo"
            src={BRAND_LOGO_URL}
            alt="Xeilom"
            width={140}
            height={34}
          />
        </div>

        <div className="header-divider" aria-hidden />

        <div className="header-product">
          <p className="header-eyebrow">XH&apos;system · Grade 3 TV</p>
          <h1>Configurateur coffrets</h1>
        </div>
      </div>
    </header>
  );
}
