import { useState } from "react";

/**
 * Saisie d'une référence logique pour charger la configuration.
 * @param {{ onApply: (ref: string) => void }} props
 */
export function RefApplyField({ onApply }) {
  const [value, setValue] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onApply(trimmed);
  };

  return (
    <form className="ref-apply-field" onSubmit={handleSubmit}>
      <label className="ref-apply-label" htmlFor="ref-apply-input">
        Charger une référence
      </label>
      <div className="ref-apply-row">
        <input
          id="ref-apply-input"
          className="ref-apply-input"
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="XHG3M-4RJ-DTI-4TV"
          spellCheck={false}
          autoComplete="off"
        />
        <button type="submit" className="btn ghost btn-sm" disabled={!value.trim()}>
          Appliquer
        </button>
      </div>
    </form>
  );
}
