import { getOptionsInGroup } from "../utils/compatibility.js";
import { getGroupMeta } from "../utils/bomBuilder.js";
import { OptionGroupHeader } from "./OptionGroupHeader.jsx";
import { OptionTile } from "./OptionTile.jsx";

/**
 * @param {Object} props
 */
export function OptionGroup({
  group,
  state,
  onSelect,
  onClear,
  getOptionState,
  headerless = false,
}) {
  const meta = getGroupMeta(group);
  const options = getOptionsInGroup(group, state);
  const selected = state.options[group];

  return (
    <div className={headerless ? "option-group option-group--embedded" : "option-group"}>
      {!headerless && (
        <OptionGroupHeader
          title={meta.label}
          description={meta.description}
          showClear={meta.optional && Boolean(selected)}
          onClear={() => onClear(group)}
        />
      )}

      <div className="option-grid">
        {meta.optional && (
          <OptionTile
            variant="none"
            label="Aucun"
            selected={!selected}
            onSelect={() => onClear(group)}
          />
        )}

        {options.map((opt) => {
          const { disabled, reason } = getOptionState(opt.id);
          const isSel = state.options[group] === opt.id;

          return (
            <OptionTile
              key={opt.id}
              label={opt.label}
              sku={opt.sku}
              image={opt.image}
              imageSource={opt.imageSource}
              productUrl={opt.productUrl}
              selected={isSel}
              disabled={disabled}
              disabledReason={reason}
              onSelect={() => onSelect(group, opt.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
