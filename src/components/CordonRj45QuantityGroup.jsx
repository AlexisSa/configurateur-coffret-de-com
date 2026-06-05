import { getGroupMeta } from "../utils/bomBuilder.js";
import {
  getCordonRj45Option,
  getCordonRj45QuantityError,
  parseCordonRj45Quantity,
} from "../utils/cordonRj45.js";
import { getMaxRj45Count, getRj45QuantityPresets } from "../utils/rj45.js";
import { OptionGroupHeader } from "./OptionGroupHeader.jsx";
import { QuantityOptionPanel } from "./QuantityOptionPanel.jsx";

/**
 * @param {Object} props
 */
export function CordonRj45QuantityGroup({
  state,
  onQuantityChange,
  onClear,
  headerless = false,
}) {
  const meta = getGroupMeta("cordon_rj45");
  const option = getCordonRj45Option(state);
  const max = getMaxRj45Count(state.gammeId);
  const quantity = parseCordonRj45Quantity(state.options.cordon_rj45);
  const error = getCordonRj45QuantityError(quantity, state.gammeId);
  const presets = getRj45QuantityPresets(max);
  const presetSelected = presets.includes(quantity);

  if (!option) return null;

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
        label={option.label}
        sku={option.sku}
        image={option.image}
        imageSource={option.imageSource}
        productUrl={option.productUrl}
        quantity={quantity}
        max={max}
        presets={presets}
        unitSingular="cordon"
        unitPlural="cordons"
        allowCustom
        customSelected={quantity > 0 && !presetSelected}
        error={error}
        onSelectQuantity={onQuantityChange}
        onClear={onClear}
      />
    </div>
  );
}
