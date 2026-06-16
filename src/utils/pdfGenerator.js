import { loadBrandLogoForPdf } from "./brandLogo.js";
import { loadProductImageForPdf } from "./productImage.js";
import { getConfiguredCoffretRef } from "./bomDisplay.js";
import { catalog } from "./catalog.js";
import { getOrderPricingLines } from "./orderPricing.js";
import { normalizeCoffretCount } from "./coffretQuantity.js";
import {
  formatVatLabel,
  getPricedTotalHT,
  getPricingDisclaimer,
  getTotalTTC,
  hasPricedLines,
} from "./pricing.js";

/** @typedef {{ r: number, g: number, b: number }} Rgb */
/** @typedef {{ x: number, w: number, align?: "left" | "center" | "right" }} Col */

/** @type {Record<string, Rgb>} */
const COLORS = {
  brand: { r: 54, g: 59, b: 199 },
  brandDark: { r: 43, g: 47, b: 159 },
  accent: { r: 24, g: 24, b: 27 },
  text: { r: 24, g: 24, b: 27 },
  muted: { r: 113, g: 113, b: 122 },
  subtle: { r: 161, g: 161, b: 170 },
  border: { r: 228, g: 228, b: 231 },
  surface: { r: 250, g: 250, b: 251 },
  rowAlt: { r: 247, g: 247, b: 248 },
  skuBg: { r: 243, g: 244, b: 246 },
  white: { r: 255, g: 255, b: 255 },
};

const MARGIN = 14;
const PAGE_W = 210;
const CONTENT_W = PAGE_W - MARGIN * 2;
const CONTENT_RIGHT = MARGIN + CONTENT_W;
const BOX_PAD = 5;
const TABLE_PAD = 3;
const TABLE_LEFT = MARGIN + TABLE_PAD;
const TABLE_RIGHT = CONTENT_RIGHT - TABLE_PAD;
const COL_GAP = 3;
const IMG_COL_W = 16;
const IMG_MAX = 12;
const BODY_BOTTOM = 262;
const FOOTER_Y = 288;
const LINE_H = 4.2;
const BASELINE = 3.2;

/**
 * Prix lisibles par jsPDF (pas d’espace fine Unicode d’Intl).
 * @param {number|null|undefined} amount
 */
export function formatPdfPrice(amount) {
  if (amount == null) return "—";
  const [intPart, decPart] = amount.toFixed(2).split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${grouped},${decPart} €`;
}

/**
 * @param {jsPDF} doc
 * @param {Rgb} color
 */
function setFill(doc, color) {
  doc.setFillColor(color.r, color.g, color.b);
}

/**
 * @param {jsPDF} doc
 * @param {Rgb} color
 */
function setText(doc, color) {
  doc.setTextColor(color.r, color.g, color.b);
}

/**
 * @param {jsPDF} doc
 * @param {Rgb} color
 */
function setDraw(doc, color) {
  doc.setDrawColor(color.r, color.g, color.b);
}

/**
 * @param {jsPDF} doc
 * @param {string} text
 */
function textW(doc, text) {
  return doc.getTextWidth(text);
}

/**
 * @param {jsPDF} doc
 * @param {Col} col
 * @param {number} y
 * @param {string} text
 */
function drawCol(doc, col, y, text) {
  const align = col.align ?? "left";
  const x =
    align === "right"
      ? col.x + col.w
      : align === "center"
        ? col.x + col.w / 2
        : col.x;
  doc.text(text, x, y, { align });
}

/**
 * @param {jsPDF} doc
 * @param {string} text
 * @param {number} maxWidth
 */
function wrapText(doc, text, maxWidth) {
  return doc.splitTextToSize(text, maxWidth);
}

/**
 * @param {jsPDF} doc
 * @param {import("./bomBuilder.js").BomLine[]} bom
 * @param {boolean} showPrices
 */
function measureTableLayout(doc, bom, showPrices) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  let refW = textW(doc, "RÉF.");
  for (const line of bom) {
    refW = Math.max(refW, textW(doc, line.sku) + 6);
  }
  refW = Math.min(Math.max(refW, 20), 34);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  let qtyW = textW(doc, "Qté");
  for (const line of bom) {
    qtyW = Math.max(qtyW, textW(doc, String(line.quantity)));
  }
  qtyW = Math.max(qtyW + 4, 9);

  let unitW = 0;
  let totalW = 0;
  if (showPrices) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    unitW = textW(doc, "PU HT");
    totalW = textW(doc, "Total HT");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    for (const line of bom) {
      if (line.unitPriceHT != null) {
        unitW = Math.max(unitW, textW(doc, formatPdfPrice(line.unitPriceHT)));
      }
      if (line.lineTotalHT != null) {
        doc.setFont("helvetica", "bold");
        totalW = Math.max(totalW, textW(doc, formatPdfPrice(line.lineTotalHT)));
        doc.setFont("helvetica", "normal");
      }
    }

    const totalHT = getPricedTotalHT(bom);
    doc.setFont("helvetica", "bold");
    totalW = Math.max(
      totalW,
      textW(doc, formatPdfPrice(totalHT)),
      textW(doc, formatPdfPrice(getTotalTTC(totalHT)))
    );
    doc.setFont("helvetica", "normal");
    unitW += 4;
    totalW += 4;
  }

  const totalCol = showPrices
    ? { x: TABLE_RIGHT - totalW, w: totalW, align: "right" }
    : null;
  const unitCol = showPrices
    ? {
        x: totalCol.x - COL_GAP - unitW,
        w: unitW,
        align: "right",
      }
    : null;
  const qtyCol = {
    x: (unitCol?.x ?? TABLE_RIGHT) - COL_GAP - qtyW,
    w: qtyW,
    align: "center",
  };
  const labelCol = {
    x: TABLE_LEFT + IMG_COL_W + COL_GAP + refW + COL_GAP,
    w: Math.max(
      20,
      qtyCol.x - COL_GAP - (TABLE_LEFT + IMG_COL_W + COL_GAP + refW + COL_GAP)
    ),
  };
  const imgCol = { x: TABLE_LEFT, w: IMG_COL_W };
  const refCol = { x: imgCol.x + imgCol.w + COL_GAP, w: refW };

  return {
    img: imgCol,
    ref: refCol,
    label: labelCol,
    qty: qtyCol,
    unit: unitCol,
    total: totalCol,
  };
}

/**
 * @param {import("./productImage.js").PdfImageAsset | null} asset
 * @param {number} maxW
 * @param {number} maxH
 */
function getPdfImageSize(asset, maxW, maxH) {
  if (!asset) return null;
  const ratio = asset.width / asset.height;
  let w = maxW;
  let h = w / ratio;
  if (h > maxH) {
    h = maxH;
    w = h * ratio;
  }
  return { w, h };
}

/**
 * @param {import("./brandLogo.js").BrandLogoAsset | null} logo
 * @returns {{ w: number, h: number } | null}
 */
function getPdfLogoSize(logo) {
  if (!logo) return null;
  const maxH = 10;
  const maxW = 52;
  let w = (logo.width / logo.height) * maxH;
  let h = maxH;
  if (w > maxW) {
    w = maxW;
    h = (logo.height / logo.width) * maxW;
  }
  return { w, h };
}

/**
 * @param {jsPDF} doc
 * @param {boolean} continuation
 * @param {import("./brandLogo.js").BrandLogoAsset | null} [logo]
 */
function drawPageHeader(doc, continuation, logo = null) {
  if (!continuation) {
    const headerH = 34;
    setFill(doc, COLORS.white);
    doc.rect(0, 0, PAGE_W, headerH, "F");

    setFill(doc, COLORS.brand);
    doc.rect(0, 0, PAGE_W, 1.2, "F");

    const logoSize = getPdfLogoSize(logo);
    if (logo && logoSize) {
      doc.addImage(
        logo.dataUrl,
        "PNG",
        MARGIN,
        (headerH - logoSize.h) / 2,
        logoSize.w,
        logoSize.h
      );
    }

    const textX = logo && logoSize ? MARGIN + logoSize.w + 6 : MARGIN;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    setText(doc, COLORS.accent);
    doc.text("Nomenclature coffret", textX, 13);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setText(doc, COLORS.muted);
    doc.text(catalog.meta.brand, textX, 19);

    const dateStr = new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "long",
    }).format(new Date());
    doc.setFontSize(7.5);
    setText(doc, COLORS.subtle);
    doc.text(
      `${dateStr} · Configurateur coffrets de communication`,
      textX,
      25
    );

    setDraw(doc, COLORS.border);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, headerH - 0.5, CONTENT_RIGHT, headerH - 0.5);

    return 42;
  }

  setFill(doc, COLORS.brand);
  doc.rect(MARGIN, 10, 12, 0.8, "F");
  setDraw(doc, COLORS.border);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, 18, CONTENT_RIGHT, 18);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  setText(doc, COLORS.accent);
  doc.text(`${catalog.meta.brand} — Nomenclature (suite)`, MARGIN, 16);
  return 24;
}

/**
 * @param {jsPDF} doc
 * @param {number} y
 * @param {{ societe?: string, clientName?: string, email?: string, telephone?: string, commentaire?: string }} internal
 */
function drawClientBlock(doc, y, internal) {
  const rows = [
    internal.clientName && { label: "Nom complet", value: internal.clientName },
    internal.societe && { label: "Société", value: internal.societe },
    internal.email && { label: "Email", value: internal.email },
    internal.telephone && { label: "Téléphone", value: internal.telephone },
    internal.commentaire?.trim() && {
      label: "Commentaire",
      value: internal.commentaire.trim(),
    },
  ].filter(Boolean);

  if (rows.length === 0) return y;

  const innerX = MARGIN + BOX_PAD;
  const labelW = 22;
  const valueX = innerX + labelW;
  const valueW = CONTENT_W - BOX_PAD * 2 - labelW;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const valueLines = rows.map((row) => wrapText(doc, row.value, valueW));
  const rowHeights = valueLines.map((lines) => lines.length * LINE_H);
  const rowGap = 2.5;
  const contentH =
    rowHeights.reduce((sum, h) => sum + h, 0) +
    (rows.length - 1) * rowGap;
  const boxH = BOX_PAD * 2 + contentH;

  setFill(doc, COLORS.surface);
  setDraw(doc, COLORS.border);
  doc.setLineWidth(0.2);
  doc.roundedRect(MARGIN, y, CONTENT_W, boxH, 2, 2, "FD");

  let rowTop = y + BOX_PAD;
  rows.forEach((row, index) => {
    const baseline = rowTop + BASELINE;
    doc.setFont("helvetica", "bold");
    setText(doc, COLORS.muted);
    doc.text(row.label, innerX, baseline);

    doc.setFont("helvetica", "normal");
    setText(doc, COLORS.text);
    let lineY = baseline;
    for (const line of valueLines[index]) {
      doc.text(line, valueX, lineY);
      lineY += LINE_H;
    }
    rowTop += rowHeights[index];
    if (index < rows.length - 1) rowTop += rowGap;
  });

  return y + boxH + 5;
}

/**
 * @param {jsPDF} doc
 * @param {number} y
 * @param {string|null} configRef
 */
function drawConfiguredRefBlock(doc, y, configRef) {
  if (!configRef) return y;

  const innerX = MARGIN + BOX_PAD;
  const valueW = CONTENT_W - BOX_PAD * 2;
  const titleH = 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  const valueLines = wrapText(doc, configRef, valueW);
  const boxH = BOX_PAD + titleH + valueLines.length * LINE_H + BOX_PAD;

  setFill(doc, COLORS.surface);
  setDraw(doc, COLORS.border);
  doc.setLineWidth(0.2);
  doc.roundedRect(MARGIN, y, CONTENT_W, boxH, 2, 2, "FD");

  setFill(doc, COLORS.brand);
  doc.rect(MARGIN, y, 1.5, boxH, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  setText(doc, COLORS.subtle);
  doc.text("RÉFÉRENCE CONFIGURÉE", innerX, y + BOX_PAD + 3.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setText(doc, COLORS.brand);
  let valueY = y + BOX_PAD + titleH + BASELINE;
  for (const line of valueLines) {
    doc.text(line, innerX, valueY);
    valueY += LINE_H;
  }

  return y + boxH + 5;
}

/**
 * @param {jsPDF} doc
 * @param {number} y
 * @param {ReturnType<typeof measureTableLayout>} layout
 * @param {boolean} showPrices
 */
function drawTableHeader(doc, y, layout, showPrices) {
  const headerH = 7;
  setFill(doc, COLORS.surface);
  setDraw(doc, COLORS.border);
  doc.setLineWidth(0.25);
  doc.rect(MARGIN, y, CONTENT_W, headerH, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  setText(doc, COLORS.subtle);
  const hy = y + 4.8;
  doc.text("PHOTO", layout.img.x + 1, hy);
  doc.text("RÉF.", layout.ref.x + 2, hy);
  doc.text("DÉSIGNATION", layout.label.x, hy);
  drawCol(doc, layout.qty, hy, "Qté");
  if (showPrices && layout.unit && layout.total) {
    drawCol(doc, layout.unit, hy, "PU HT");
    drawCol(doc, layout.total, hy, "Total HT");
  }

  return y + headerH;
}

/**
 * @param {jsPDF} doc
 * @param {import("./bomBuilder.js").BomLine} line
 * @param {ReturnType<typeof measureTableLayout>} layout
 */
function measureRowHeight(doc, line, layout, imageAsset) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const labelLines = wrapText(doc, line.label, layout.label.w);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  const skuLines = wrapText(doc, line.sku, layout.ref.w - 4);
  const textH = Math.max(skuLines.length * 3.6, labelLines.length * LINE_H) + 5;
  const imageH = imageAsset ? IMG_MAX + 4 : 0;
  return Math.max(10, textH, imageH);
}

/**
 * @param {jsPDF} doc
 * @param {number} y
 * @param {import("./bomBuilder.js").BomLine} line
 * @param {ReturnType<typeof measureTableLayout>} layout
 * @param {boolean} striped
 * @param {boolean} showPrices
 */
function drawTableRow(doc, y, line, layout, striped, showPrices, imageAsset) {
  const rowH = measureRowHeight(doc, line, layout, imageAsset);

  if (striped) {
    setFill(doc, COLORS.rowAlt);
    doc.rect(MARGIN, y, CONTENT_W, rowH, "F");
  }

  setDraw(doc, COLORS.border);
  doc.setLineWidth(0.1);
  doc.line(MARGIN, y + rowH, CONTENT_RIGHT, y + rowH);

  const imageSize = getPdfImageSize(imageAsset, IMG_MAX, IMG_MAX);
  if (imageSize) {
    const imgX = layout.img.x + (layout.img.w - imageSize.w) / 2;
    const imgY = y + (rowH - imageSize.h) / 2;
    setFill(doc, COLORS.white);
    setDraw(doc, COLORS.border);
    doc.setLineWidth(0.1);
    doc.roundedRect(
      imgX - 0.4,
      imgY - 0.4,
      imageSize.w + 0.8,
      imageSize.h + 0.8,
      0.6,
      0.6,
      "FD"
    );
    doc.addImage(
      imageAsset.dataUrl,
      "PNG",
      imgX,
      imgY,
      imageSize.w,
      imageSize.h
    );
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  const skuLines = wrapText(doc, line.sku, layout.ref.w - 4);
  const skuH = skuLines.length * 3.4 + 1.2;
  setFill(doc, COLORS.skuBg);
  setDraw(doc, COLORS.border);
  doc.setLineWidth(0.1);
  doc.roundedRect(layout.ref.x + 2, y + 2.5, layout.ref.w - 4, skuH, 1, 1, "FD");
  setText(doc, COLORS.accent);
  doc.text(skuLines, layout.ref.x + 4, y + 5.2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  setText(doc, COLORS.text);
  let labelY = y + 5;
  for (const labelLine of wrapText(doc, line.label, layout.label.w)) {
    doc.text(labelLine, layout.label.x, labelY);
    labelY += LINE_H;
  }

  const numY = y + 5.2;
  drawCol(doc, layout.qty, numY, String(line.quantity));

  if (showPrices && layout.unit && layout.total) {
    setText(doc, COLORS.muted);
    drawCol(
      doc,
      layout.unit,
      numY,
      formatPdfPrice(line.unitPriceHT)
    );
    doc.setFont("helvetica", "bold");
    setText(doc, COLORS.text);
    drawCol(
      doc,
      layout.total,
      numY,
      formatPdfPrice(line.lineTotalHT)
    );
    doc.setFont("helvetica", "normal");
  }

  return rowH;
}

/**
 * @param {jsPDF} doc
 * @param {number} y
 * @param {import("./bomBuilder.js").BomLine[]} bom
 */
function drawTotalsBlock(doc, y, bom, pricingTierCode, coffretCount) {
  const pricingLines = getOrderPricingLines(
    bom,
    normalizeCoffretCount(coffretCount)
  );
  const innerX = MARGIN + BOX_PAD;
  const valueX = CONTENT_RIGHT - BOX_PAD;
  const labelMaxW = CONTENT_W - BOX_PAD * 2 - 40;

  const wrappedRows = pricingLines.map((line) => ({
    ...line,
    labelLines: wrapText(doc, line.label, labelMaxW),
  }));

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const rowGap = 4;
  const titleH = 5;
  const rowsH = wrappedRows.reduce((sum, row) => {
    const lineH = Math.max(8.5, row.labelLines.length * 3.8);
    return sum + lineH + rowGap;
  }, 0);
  const disclaimer = getPricingDisclaimer(pricingTierCode);
  const noteLines = disclaimer
    ? wrapText(doc, disclaimer, CONTENT_W - BOX_PAD * 2)
    : [];
  const noteH = noteLines.length > 0 ? noteLines.length * 3.2 + 4 : 0;
  const boxH = BOX_PAD + titleH + rowsH + noteH + BOX_PAD;

  setFill(doc, COLORS.surface);
  setDraw(doc, COLORS.border);
  doc.setLineWidth(0.25);
  doc.roundedRect(MARGIN, y, CONTENT_W, boxH, 2.5, 2.5, "FD");

  setFill(doc, COLORS.brand);
  doc.rect(MARGIN, y, 1.5, boxH, "F");

  let cursorY = y + BOX_PAD;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  setText(doc, COLORS.subtle);
  doc.text("ESTIMATION INDICATIVE", innerX, cursorY + 3.5);
  cursorY += titleH;

  for (const row of wrappedRows) {
    const lineH = Math.max(8.5, row.labelLines.length * 3.8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(row.highlight ? 10 : 8.5);
    setText(doc, COLORS.muted);
    let labelY = cursorY + BASELINE;
    for (const labelLine of row.labelLines) {
      doc.text(labelLine, innerX, labelY);
      labelY += 3.8;
    }
    doc.setFont("helvetica", "bold");
    setText(doc, COLORS.accent);
    doc.text(formatPdfPrice(row.amount), valueX, cursorY + BASELINE, {
      align: "right",
    });
    cursorY += lineH + rowGap;
  }

  if (noteLines.length > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    setText(doc, COLORS.muted);
    for (const line of noteLines) {
      doc.text(line, innerX, cursorY + BASELINE);
      cursorY += 3.2;
    }
  }

  return y + boxH + 4;
}

/**
 * @param {jsPDF} doc
 */
function drawFooters(doc) {
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p += 1) {
    doc.setPage(p);
    setDraw(doc, COLORS.border);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, FOOTER_Y - 4, CONTENT_RIGHT, FOOTER_Y - 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    setText(doc, COLORS.subtle);
    doc.text(
      `${catalog.meta.brand} · Nomenclature coffret de communication`,
      MARGIN,
      FOOTER_Y
    );
    doc.text(`Page ${p} / ${pageCount}`, CONTENT_RIGHT, FOOTER_Y, {
      align: "right",
    });
  }
}

export const BOM_PDF_FILENAME = "nomenclature-coffret.pdf";

/**
 * @param {import('./compatibility.js').ConfigState} state
 * @param {{ societe?: string, clientName?: string, email?: string, telephone?: string }} [internal]
 * @returns {Promise<import('jspdf').jsPDF|null>}
 */
export async function buildBomPdf(state, internal = {}, pricingTierCode) {
  const bom = buildBom(state, pricingTierCode);
  if (bom.length === 0) return null;

  const { default: jsPDF } = await import("jspdf");
  const [logo, ...imageAssets] = await Promise.all([
    loadBrandLogoForPdf(),
    ...bom.map((line) => loadProductImageForPdf(line.image, line.imageSource)),
  ]);
  const showPrices = hasPricedLines(bom);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const layout = measureTableLayout(doc, bom, showPrices);

  let y = drawPageHeader(doc, false, logo);
  y = drawClientBlock(doc, y, internal);
  y = drawConfiguredRefBlock(doc, y, getConfiguredCoffretRef(bom));
  y = drawTableHeader(doc, y, layout, showPrices);

  let rowIndex = 0;
  for (let i = 0; i < bom.length; i += 1) {
    const line = bom[i];
    const imageAsset = imageAssets[i] ?? null;
    const rowH = measureRowHeight(doc, line, layout, imageAsset);
    if (y + rowH > BODY_BOTTOM) {
      doc.addPage();
      y = drawPageHeader(doc, true);
      y = drawTableHeader(doc, y, layout, showPrices);
      rowIndex = 0;
    }
    y += drawTableRow(
      doc,
      y,
      line,
      layout,
      rowIndex % 2 === 1,
      showPrices,
      imageAsset
    );
    rowIndex += 1;
  }

  if (showPrices) {
    y += 4;
    if (y + 40 > BODY_BOTTOM) {
      doc.addPage();
      y = drawPageHeader(doc, true);
    }
    drawTotalsBlock(doc, y, bom, pricingTierCode, state.coffretCount);
  }

  drawFooters(doc);
  return doc;
}

/**
 * @param {import('./compatibility.js').ConfigState} state
 * @param {{ societe?: string, clientName?: string, email?: string, telephone?: string }} [internal]
 * @returns {Promise<Blob|null>}
 */
export async function createBomPdfBlob(state, internal = {}, pricingTierCode) {
  const doc = await buildBomPdf(state, internal, pricingTierCode);
  if (!doc) return null;
  return doc.output("blob");
}

/**
 * @param {import('./compatibility.js').ConfigState} state
 * @param {{ societe?: string, clientName?: string, email?: string, telephone?: string }} [internal]
 */
export async function downloadBomPdf(state, internal = {}, pricingTierCode) {
  const doc = await buildBomPdf(state, internal, pricingTierCode);
  if (!doc) return false;
  doc.save(BOM_PDF_FILENAME);
  return true;
}
