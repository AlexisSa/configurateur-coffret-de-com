// @ts-check
import { catalog, getGammeById, getGroupsForGamme, getOptionById } from "./catalog.js";
import { buildGammeSku } from "./gammeSku.js";
import {
  isConfigurationComplete,
  isGroupHidden,
  isOptionSelectable,
} from "./compatibility.js";
import { normalizeCoffretCount } from "./coffretQuantity.js";
import { applyPricingToBom } from "./pricing.js";
import {
  getCordonRj45Option,
  getCordonRj45QuantityError,
  parseCordonRj45Quantity,
} from "./cordonRj45.js";
import { getPriseOption, getPriseQuantityError, parsePriseQuantity } from "./prise.js";
import { getRj45QuantityError, parseRj45Quantity } from "./rj45.js";
import { isQuantityGroup } from "./quantityGroups.js";
import {
  gammeIncludesIncludedItem,
  INCLUDED_ITEM_IDS,
} from "./includedItems.js";

/**
 * @typedef {Object} BomLine
 * @property {string} sku
 * @property {string} label
 * @property {number} quantity
 * @property {'base'|'option'|'materiau'} type
 * @property {string} [productUrl]
 * @property {string} [image]
 * @property {string} [imageSource]
 * @property {number} [unitPriceHT]
 * @property {number} [lineTotalHT]
 */

/**
 * @param {import('./compatibility.js').ConfigState} state
 * @param {string} [pricingTierCode]
 * @returns {BomLine[]}
 */
export function buildBom(state, pricingTierCode) {
  if (!isConfigurationComplete(state)) return [];

  const gamme = getGammeById(state.gammeId);
  if (!gamme) return [];

  const materiau = gamme.materiaux.find((m) => m.id === state.materiau);
  const lines = [];

  const brassageOption = state.options.brassage
    ? getOptionById(state.options.brassage)
    : null;

  lines.push({
    sku: buildGammeSku(gamme, materiau, state.options),
    label: [
      gamme.label,
      materiau?.label,
      brassageOption?.id === "brassage-exterieur" ? "brassage extérieur" : null,
    ]
      .filter(Boolean)
      .join(" — "),
    quantity: 1,
    type: "base",
    productUrl: gamme.productUrl,
    image: gamme.image,
    imageSource: gamme.imageSource,
  });

  const terreBornier = catalog.components?.terreBornier;
  const terreIncludedInCoffret = gammeIncludesIncludedItem(
    state.gammeId,
    INCLUDED_ITEM_IDS.TERRE_BORNIER
  );
  if (terreBornier && !terreIncludedInCoffret) {
    lines.push({
      sku: terreBornier.sku,
      label: terreBornier.label,
      quantity: 1,
      type: "option",
      productUrl: terreBornier.productUrl,
      image: terreBornier.image,
      imageSource: terreBornier.imageSource,
    });
  }

  if (!isGroupHidden("rj45", state)) {
    const rj45Qty = parseRj45Quantity(state.options.rj45);
    if (rj45Qty > 0 && !getRj45QuantityError(rj45Qty, state.gammeId)) {
      lines.push(...buildEmbaseRj45Lines(rj45Qty));
    }
  }

  if (!isGroupHidden("prise", state)) {
    const priseQty = parsePriseQuantity(state.options.prise);
    const priseOption = getPriseOption(state);
    if (
      priseOption &&
      priseQty > 0 &&
      !getPriseQuantityError(priseQty, state.gammeId)
    ) {
      lines.push(...buildOptionBomLines(priseOption, priseQty));
    }
  }

  if (!isGroupHidden("cordon_rj45", state)) {
    const cordonQty = parseCordonRj45Quantity(state.options.cordon_rj45);
    const cordonOption = getCordonRj45Option(state);
    if (
      cordonOption &&
      cordonQty > 0 &&
      !getCordonRj45QuantityError(cordonQty, state.gammeId)
    ) {
      lines.push(...buildOptionBomLines(cordonOption, cordonQty));
    }
  }

  const selectedIds = Object.entries(state.options)
    .filter(([group, id]) => !isQuantityGroup(group) && id)
    .map(([, id]) => id);
  const counts = {};

  for (const optionId of selectedIds) {
    if (!isOptionSelectable(optionId, state)) continue;
    counts[optionId] = (counts[optionId] ?? 0) + 1;
  }

  for (const [optionId, count] of Object.entries(counts)) {
    const option = getOptionById(optionId);
    if (!option || option.rules?.virtual) continue;
    lines.push(...buildOptionBomLines(option, count));
  }

  return applyPricingToBom(lines, pricingTierCode);
}

/**
 * @param {number} quantity
 * @returns {BomLine[]}
 */
export function buildEmbaseRj45Lines(quantity) {
  const comp = catalog.components?.embaseRj45;
  if (!comp) return [];

  const lines = [];
  let remaining = quantity;

  if (comp.skuLot24 && remaining >= 24) {
    const lots = Math.floor(remaining / 24);
    lines.push({
      sku: comp.skuLot24,
      label: `Lot de 24 — ${comp.label} (${comp.brand})`,
      quantity: lots,
      type: "option",
      productUrl: comp.productUrl,
      image: comp.image,
      imageSource: comp.imageSource,
    });
    remaining -= lots * 24;
  }

  if (remaining > 0) {
    lines.push({
      sku: comp.sku,
      label: `${comp.label} (${comp.brand})`,
      quantity: remaining,
      type: "option",
      productUrl: comp.productUrl,
      image: comp.image,
      imageSource: comp.imageSource,
    });
  }

  return lines;
}

/**
 * @param {import('./catalog.js').ReturnType<typeof getOptionById>} option
 * @param {number} quantity
 */
function buildOptionBomLines(option, quantity) {
  return [
    {
      sku: option.sku,
      label: option.label,
      quantity,
      type: "option",
      productUrl: option.productUrl,
      image: option.image,
      imageSource: option.imageSource,
    },
  ];
}

/**
 * @param {import('./compatibility.js').ConfigState} state
 */
export function getConfigurationSummary(state) {
  const gamme = getGammeById(state.gammeId);
  if (!gamme) return "";

  const materiau = gamme.materiaux.find((m) => m.id === state.materiau);
  const coffretCount = normalizeCoffretCount(state.coffretCount);
  const parts = [];
  if (coffretCount > 1) parts.push(`${coffretCount}× ${gamme.label}`);
  else parts.push(gamme.label);
  if (materiau) parts.push(materiau.label);

  for (const group of getGroupsForGamme(gamme)) {
    const optionId = state.options[group];
    if (!optionId) continue;

    if (group === "rj45") {
      const qty = parseRj45Quantity(optionId);
      if (qty > 0) parts.push(`${qty} embases RJ45 Unikkern`);
      continue;
    }

    if (group === "prise") {
      const qty = parsePriseQuantity(optionId);
      if (qty > 0) {
        parts.push(`${qty} prise${qty > 1 ? "s" : ""} 2P+T`);
      }
      continue;
    }

    if (group === "cordon_rj45") {
      const qty = parseCordonRj45Quantity(optionId);
      if (qty > 0) {
        parts.push(`${qty} cordon${qty > 1 ? "s" : ""} RJ45 0,50 m`);
      }
      continue;
    }

    const opt = getOptionById(optionId);
    if (opt && isOptionSelectable(optionId, state)) parts.push(opt.label);
  }

  return parts.join(" · ");
}

/**
 * @param {string} group
 */
export function getGroupMeta(group) {
  return catalog.optionGroups[group] ?? { label: group, type: "single", optional: true };
}
