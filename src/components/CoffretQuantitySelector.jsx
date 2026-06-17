import { useEffect, useId, useState } from "react";
import {
  MAX_COFFRET_COUNT,
  MIN_COFFRET_COUNT,
  normalizeCoffretCount,
} from "../utils/coffretQuantity.js";

/**
 * @param {{ count: number, onChange: (n: number) => void, className?: string }} props
 */
export function CoffretQuantitySelector({ count, onChange, className = "" }) {
  const inputId = useId();
  const [draft, setDraft] = useState(String(count));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setDraft(String(count));
    }
  }, [count, focused]);

  const commitDraft = (raw) => {
    const normalized = normalizeCoffretCount(
      raw === "" ? MIN_COFFRET_COUNT : Number.parseInt(raw, 10)
    );
    onChange(normalized);
    setDraft(String(normalized));
  };

  return (
    <section
      className={["panel panel-coffret-qty", className].filter(Boolean).join(" ")}
    >
      <label className="coffret-qty-label" htmlFor={inputId}>
        Nombre de coffrets
      </label>
      <div className="coffret-qty-row">
        <input
          id={inputId}
          type="number"
          className="coffret-qty-input"
          min={MIN_COFFRET_COUNT}
          max={MAX_COFFRET_COUNT}
          step={1}
          value={draft}
          onFocus={() => setFocused(true)}
          onChange={(e) => {
            const raw = e.target.value;
            setDraft(raw);
            if (raw === "") return;
            const n = Number.parseInt(raw, 10);
            if (Number.isFinite(n)) onChange(normalizeCoffretCount(n));
          }}
          onBlur={() => {
            setFocused(false);
            commitDraft(draft);
          }}
        />
        <span className="coffret-qty-hint">
          de {MIN_COFFRET_COUNT} à {MAX_COFFRET_COUNT.toLocaleString("fr-FR")}
        </span>
      </div>
    </section>
  );
}
