/**
 * En-tête commun pour chaque bloc d’options.
 * @param {{ title: string, description?: string, showClear?: boolean, clearLabel?: string, onClear?: () => void }} props
 */
export function OptionGroupHeader({
  title,
  description,
  showClear = false,
  clearLabel = "Aucun",
  onClear,
}) {
  return (
    <div className="option-group-header">
      <div className="option-group-heading">
        <h3>{title}</h3>
        {description && (
          <p className="option-group-desc">{description}</p>
        )}
      </div>
      {showClear && onClear && (
        <button type="button" className="link-btn" onClick={onClear}>
          {clearLabel}
        </button>
      )}
    </div>
  );
}
