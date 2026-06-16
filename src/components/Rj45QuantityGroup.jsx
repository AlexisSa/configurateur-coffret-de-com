import { catalog } from "../utils/catalog.js";
import {
  getMaxRj45Count,
  getRj45QuantityError,
  getRj45QuantityPresets,
  parseRj45Quantity,
} from "../utils/rj45.js";
import { getGroupMeta } from "../utils/bomBuilder.js";
import { OptionGroupHeader } from "./OptionGroupHeader.jsx";
import { QuantityOptionPanel } from "./QuantityOptionPanel.jsx";

/**
 * @param {Object} props
 */
export function Rj45QuantityGroup({
  state,
  onQuantityChange,
  onClear,
  explicitNone = false,
  headerless = false,
}) {
  const meta = getGroupMeta("rj45");
  const comp = catalog.components?.embaseRj45;
  const max = getMaxRj45Count(state.gammeId);
  const quantity = parseRj45Quantity(state.options.rj45);
  const error = getRj45QuantityError(quantity, state.gammeId);
  const presets = getRj45QuantityPresets(max);
  const presetSelected = presets.includes(quantity);

  if (!comp) return null;

  return (
    <div className={headerless ? "option-group option-group--embedded" : "option-group"}>
      {!headerless && (
        <OptionGroupHeader
          title={meta.label}
          description={meta.description}
          showClear={quantity > 0}
          onClear={onClear}
        />
      )}

      <QuantityOptionPanel
        label={comp.label}
        sku={comp.sku}
        brand={comp.brand}
        image={comp.image}
        imageSource={comp.imageSource}
        productUrl={comp.productUrl}
        quantity={quantity}
        max={max}
        presets={presets}
        unitSingular="embase"
        unitPlural="embases"
        allowCustom
        customSelected={quantity > 0 && !presetSelected}
        error={error}
        explicitNone={explicitNone}
        onSelectQuantity={onQuantityChange}
        onClear={onClear}
      />
    </div>
  );
}
