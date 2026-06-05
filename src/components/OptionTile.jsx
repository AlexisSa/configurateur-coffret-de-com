import { Ban, Box, Check, ExternalLink } from "lucide-react";
import { ProductVisual } from "./ProductVisual.jsx";

/**
 * Tuile de sélection d’option (même gabarit pour tous les groupes).
 * @param {Object} props
 */
export function OptionTile({
  label,
  sublabel,
  selected = false,
  disabled = false,
  disabledReason,
  onSelect,
  image,
  imageSource,
  productUrl,
  sku,
  variant = "default",
  quantityValue,
}) {
  const hasImage = Boolean(image || imageSource);

  return (
    <div
      className={[
        "option-tile",
        selected && "selected",
        disabled && "disabled",
        variant !== "default" && `option-tile--${variant}`,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className="option-tile-main"
        onClick={() => !disabled && onSelect()}
        disabled={disabled}
        aria-pressed={selected}
        title={disabled ? disabledReason : undefined}
      >
        {selected && (
          <span className="option-tile-check" aria-hidden>
            <Check size={12} strokeWidth={3} />
          </span>
        )}

        <div className="option-tile-visual">
          {variant === "none" && <Ban size={28} strokeWidth={1.5} className="option-tile-icon" />}
          {variant === "quantity" && (
            <span className="option-tile-qty">{quantityValue}</span>
          )}
          {variant === "default" && hasImage && (
            <ProductVisual
              image={image}
              imageSource={imageSource}
              alt=""
              className="option-tile-image"
            />
          )}
          {variant === "default" && !hasImage && (
            <>
              <Box size={26} strokeWidth={1.5} className="option-tile-icon" />
              {sku && <span className="option-tile-sku">{sku}</span>}
            </>
          )}
        </div>

        {label && <span className="option-tile-label">{label}</span>}
        {sublabel && <span className="option-tile-sublabel">{sublabel}</span>}
        {disabled && disabledReason && (
          <span className="option-tile-reason">{disabledReason}</span>
        )}
      </button>

      {productUrl && (
        <a
          className="option-tile-link"
          href={productUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink size={13} strokeWidth={2} aria-hidden />
          Fiche produit
        </a>
      )}
    </div>
  );
}
