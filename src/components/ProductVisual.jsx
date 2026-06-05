import { useState } from "react";

/**
 * Affiche une image produit (local puis CDN Xeilom en secours).
 * @param {{ image?: string, imageSource?: string, alt?: string, className?: string }} props
 */
export function ProductVisual({ image, imageSource, alt = "", className = "product-visual" }) {
  const [source, setSource] = useState(image ? "local" : imageSource ? "remote" : "none");

  const src =
    source === "local"
      ? image
      : source === "remote"
        ? imageSource
        : null;

  if (!src) {
    return <div className={`${className} product-visual-placeholder`} aria-hidden />;
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => {
        if (source === "local" && imageSource) {
          setSource("remote");
        } else {
          setSource("none");
        }
      }}
    />
  );
}
