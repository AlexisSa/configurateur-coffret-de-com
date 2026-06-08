import { Check } from "lucide-react";
import { getGammeById } from "../utils/catalog.js";
import { getIncludedItemsForGamme } from "../utils/includedItems.js";

/**
 * @param {{ gammeId: string }} props
 */
export function IncludedItemsPanel({ gammeId }) {
  const gamme = getGammeById(gammeId);
  const items = getIncludedItemsForGamme(gammeId);

  if (!gamme || items.length === 0) return null;

  return (
    <div className="included-panel" aria-labelledby="included-panel-title">
      <h2 className="included-panel-title" id="included-panel-title">
        Déjà inclus
      </h2>

      <ul className="included-list" aria-label="Éléments fournis avec le coffret">
        {items.map((item, index) => (
          <li key={item.id ?? `${item.label}-${index}`} className="included-list-item">
            <Check size={12} strokeWidth={2.5} aria-hidden className="included-list-icon" />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
