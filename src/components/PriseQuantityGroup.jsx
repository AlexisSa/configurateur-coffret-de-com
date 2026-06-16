import { getGroupMeta } from "../utils/bomBuilder.js";
import {
  getMaxPriseCount,
  getPriseOption,
  getPriseQuantityError,
  parsePriseQuantity,
} from "../utils/prise.js";
import { OptionGroupHeader } from "./OptionGroupHeader.jsx";
import { QuantityOptionPanel } from "./QuantityOptionPanel.jsx";

const PRESETS = [1, 2];

/**
 * @param {Object} props
 */
export function PriseQuantityGroup({
  state,
  onQuantityChange,
  onClear,
  explicitNone = false,
  headerless = false,
}) {
  const meta = getGroupMeta("prise");
  const option = getPriseOption(state);
  const max = getMaxPriseCount(state.gammeId);
  const quantity = parsePriseQuantity(state.options.prise);
  const error = getPriseQuantityError(quantity, state.gammeId);

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
        presets={PRESETS}
        unitSingular="prise"
        unitPlural="prises"
        error={error}
        explicitNone={explicitNone}
        onSelectQuantity={onQuantityChange}
        onClear={onClear}
      />
    </div>
  );
}
