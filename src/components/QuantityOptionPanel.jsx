import { useId, useState } from "react";
import { ExternalLink } from "lucide-react";
import { ProductVisual } from "./ProductVisual.jsx";

/**
 * Carte unique : référence produit + choix de quantité (embases RJ45, prises, etc.).
 * @param {Object} props
 */
export function QuantityOptionPanel({
  label,
  sku,
  brand,
  image,
  imageSource,
  productUrl,
  quantity,
  max,
  presets,
  unitSingular = "unité",
  unitPlural = "unités",
  allowCustom = false,
  customSelected = false,
  error,
  onSelectQuantity,
  onClear,
}) {
  const labelId = useId();
  const active = quantity > 0;
  const [customDraft, setCustomDraft] = useState("");
  const [customFocused, setCustomFocused] = useState(false);

  const customInputValue = customFocused
    ? customDraft
    : customSelected
      ? String(quantity)
      : "";

  return (
    <article
      className={["qty-option-panel", active && "qty-option-panel--active"]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="qty-option-product">
        <div className="qty-option-visual">
          <ProductVisual
            image={image}
            imageSource={imageSource}
            alt={label}
            className="qty-option-image"
          />
        </div>
        <div className="qty-option-meta">
          <p className="qty-option-title">{label}</p>
          <p className="qty-option-ref">
            Réf. <code>{sku}</code>
            {brand ? ` · ${brand}` : ""}
          </p>
          {productUrl && (
            <a
              className="qty-option-link"
              href={productUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={13} strokeWidth={2} aria-hidden />
              Fiche produit
            </a>
          )}
        </div>
      </div>

      <div className="qty-option-controls">
        <span className="qty-option-controls-label" id={labelId}>
          Quantité
          <span className="qty-option-controls-hint">max. {max}</span>
        </span>

        <div
          className="qty-option-segments"
          role="group"
          aria-labelledby={labelId}
        >
          <button
            type="button"
            className={[
              "qty-segment",
              "qty-segment--none",
              quantity === 0 && "qty-segment--selected",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-pressed={quantity === 0}
            onClick={onClear}
          >
            Aucun
          </button>

          {presets.map((n) => (
            <button
              key={n}
              type="button"
              className={[
                "qty-segment",
                quantity === n && "qty-segment--selected",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={quantity === n}
              onClick={() => {
                if (quantity === n) onClear();
                else onSelectQuantity(n);
              }}
            >
              <span className="qty-segment-value">{n}</span>
              <span className="qty-segment-unit">
                {n === 1 ? unitSingular : unitPlural}
              </span>
            </button>
          ))}

          {allowCustom && (
            <div
              className={[
                "qty-segment",
                "qty-segment--custom",
                customSelected && "qty-segment--selected",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <label className="qty-segment-custom-label">
                <span className="qty-segment-unit">Autre</span>
                <input
                  type="number"
                  className={`qty-segment-input ${error ? "invalid" : ""}`}
                  min={1}
                  max={max}
                  step={1}
                  value={customInputValue}
                  placeholder="—"
                  aria-label={`Autre quantité (${unitPlural})`}
                  onFocus={() => {
                    setCustomFocused(true);
                    setCustomDraft(customSelected ? String(quantity) : "");
                  }}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setCustomDraft(raw);
                    if (raw === "") return;
                    const n = Number.parseInt(raw, 10);
                    if (Number.isFinite(n) && n >= 1 && n !== quantity) {
                      onSelectQuantity(n);
                    }
                  }}
                  onBlur={(e) => {
                    setCustomFocused(false);
                    const raw = e.target.value.trim();
                    if (raw === "") {
                      if (customSelected) onClear();
                      setCustomDraft("");
                      return;
                    }
                    const n = Number.parseInt(raw, 10);
                    if (!Number.isFinite(n) || n < 1) {
                      setCustomDraft(customSelected ? String(quantity) : "");
                      return;
                    }
                    const clamped = Math.min(max, Math.max(1, n));
                    if (clamped !== quantity) onSelectQuantity(clamped);
                    setCustomDraft(String(clamped));
                  }}
                />
              </label>
              <span className="qty-segment-max">/ {max}</span>
            </div>
          )}
        </div>

        {error && <p className="option-qty-error">{error}</p>}
      </div>
    </article>
  );
}
