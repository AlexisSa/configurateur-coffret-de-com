import { Check, ChevronDown } from "lucide-react";

/**
 * Bloc repliable pour un groupe d'options.
 * @param {{
 *   title: string,
 *   description?: string,
 *   isConfigured?: boolean,
 *   expanded?: boolean,
 *   onToggle?: () => void,
 *   showClear?: boolean,
 *   onClear?: () => void,
 *   children: import('react').ReactNode,
 * }} props
 */
export function OptionAccordion({
  title,
  description,
  isConfigured = false,
  expanded = true,
  onToggle,
  showClear = false,
  onClear,
  children,
}) {
  return (
    <div
      className={`option-accordion ${expanded ? "option-accordion--open" : ""} ${isConfigured ? "option-accordion--configured" : ""}`}
    >
      <div className="option-accordion-header">
        <button
          type="button"
          className="option-accordion-trigger"
          onClick={onToggle}
          aria-expanded={expanded}
        >
          <span className="option-accordion-status" aria-hidden>
            {isConfigured ? (
              <Check size={14} strokeWidth={2.5} />
            ) : (
              <span className="option-accordion-status-dot" />
            )}
          </span>
          <span className="option-accordion-heading">
            <span className="option-accordion-title">{title}</span>
            {description && (
              <span className="option-accordion-desc">{description}</span>
            )}
          </span>
          <ChevronDown
            size={18}
            strokeWidth={2}
            className="option-accordion-chevron"
            aria-hidden
          />
        </button>
        {showClear && onClear && expanded && (
          <button type="button" className="link-btn option-accordion-clear" onClick={onClear}>
            Aucun
          </button>
        )}
      </div>
      {expanded && <div className="option-accordion-body">{children}</div>}
    </div>
  );
}
