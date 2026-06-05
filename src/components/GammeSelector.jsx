import { useEffect, useState } from "react";
import { catalog, getGammeById } from "../utils/catalog.js";
import {
  formatGammeDimensions,
  getGammeSelectorSubtitle,
} from "../utils/gammeDisplay.js";

/**
 * @param {string} gammeId
 * @returns {string|null}
 */
function findSegmentIdForGamme(gammeId) {
  if (!gammeId) return null;
  const segment = catalog.gammeSegments.find((s) =>
    s.items.some((item) => item.gammeId === gammeId)
  );
  return segment?.id ?? null;
}

function GammeCardImage({ gamme, className = "gamme-card-image" }) {
  const [source, setSource] = useState("local");

  const src =
    source === "local"
      ? gamme.image
      : source === "remote"
        ? gamme.imageSource
        : null;

  if (!src) {
    return (
      <div className="gamme-card-placeholder" aria-hidden>
        {gamme.label}
      </div>
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt=""
      loading="lazy"
      onError={() => {
        if (source === "local" && gamme.imageSource) {
          setSource("remote");
        } else {
          setSource("none");
        }
      }}
    />
  );
}

function GammeCard({ gamme, selected, onSelect, compact = false }) {
  const subtitle = getGammeSelectorSubtitle(gamme);

  return (
    <button
      type="button"
      className={`gamme-card ${compact ? "gamme-card--compact" : ""} ${selected ? "selected" : ""}`}
      onClick={() => onSelect(gamme.id)}
      aria-pressed={selected}
    >
      <GammeCardImage gamme={gamme} />
      <div className="gamme-card-body">
        <h3>
          {gamme.label}
          {subtitle && <span className="gamme-card-tag"> {subtitle}</span>}
        </h3>
        <p className="gamme-dims">{formatGammeDimensions(gamme)}</p>
      </div>
    </button>
  );
}

function GammePlaceholderCard({ label }) {
  return (
    <div
      className="gamme-card gamme-card--compact gamme-card--placeholder"
      aria-disabled="true"
    >
      <div className="gamme-card-placeholder gamme-card-placeholder--muted">
        {label}
      </div>
      <div className="gamme-card-body">
        <h3>{label}</h3>
        <p className="gamme-dims gamme-dims--soon">Bientôt dans le configurateur</p>
      </div>
    </div>
  );
}

/**
 * @param {{ onSelect: (id: string) => void, selectedId: string }} props
 */
export function GammeSelector({ onSelect, selectedId }) {
  const [activeSegmentId, setActiveSegmentId] = useState(
    () => findSegmentIdForGamme(selectedId) ?? catalog.gammeSegments[0]?.id ?? null
  );

  useEffect(() => {
    const segmentId = findSegmentIdForGamme(selectedId);
    if (segmentId) setActiveSegmentId(segmentId);
  }, [selectedId]);

  const activeSegment =
    catalog.gammeSegments.find((s) => s.id === activeSegmentId) ??
    catalog.gammeSegments[0];

  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="section-title">Gamme</h2>
        <span className="section-badge">Étape 1</span>
      </div>

      {!selectedId && (
        <p className="gamme-hint">
          Sélectionnez une famille à gauche, puis choisissez le coffret adapté à
          votre installation.
        </p>
      )}

      <div className="gamme-picker">
        <nav className="gamme-picker-nav" aria-label="Familles de coffrets">
          {catalog.gammeSegments.map((segment) => {
            const count = segment.items.filter((item) => item.gammeId).length;
            const isActive = segment.id === activeSegment?.id;
            const hasSelection = segment.items.some(
              (item) => item.gammeId === selectedId
            );

            return (
              <button
                key={segment.id}
                type="button"
                className={`gamme-picker-nav-item ${isActive ? "active" : ""} ${hasSelection ? "has-selection" : ""}`}
                onClick={() => setActiveSegmentId(segment.id)}
                aria-current={isActive ? "true" : undefined}
              >
                <span className="gamme-picker-nav-label">{segment.label}</span>
                {count > 0 && (
                  <span className="gamme-picker-nav-count">{count}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="gamme-picker-panel">
          <header className="gamme-picker-panel-header">
            <h3 className="gamme-picker-panel-title">{activeSegment?.label}</h3>
          </header>

          <div className="gamme-picker-grid">
            {activeSegment?.items.map((item) => {
              if (item.placeholder) {
                return (
                  <GammePlaceholderCard
                    key={item.placeholder}
                    label={item.placeholder}
                  />
                );
              }

              const gamme = getGammeById(item.gammeId);
              if (!gamme) return null;

              return (
                <GammeCard
                  key={gamme.id}
                  gamme={gamme}
                  selected={selectedId === gamme.id}
                  onSelect={onSelect}
                  compact
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
