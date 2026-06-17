/**
 * Parse une ligne CSV Oxatis (séparateur ;, champs quotés).
 * @param {string} line
 * @returns {string[]}
 */
export function parseOxatisCsvLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ";") {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  fields.push(current);
  return fields;
}

/**
 * @param {string} raw
 * @returns {{ header: string[], rows: string[][] }}
 */
export function parseOxatisCsv(raw) {
  const lines = raw.split(/\r?\n/).filter((line) => line.trim());
  const header = parseOxatisCsvLine(lines[0]);
  const rows = lines.slice(1).map(parseOxatisCsvLine);
  return { header, rows };
}

/**
 * @param {string|null|undefined} value
 * @returns {number|null}
 */
export function parseOxatisPriceHT(value) {
  if (value == null || String(value).trim() === "") return null;
  const normalized = String(value).trim().replace(",", ".");
  const amount = Number.parseFloat(normalized);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount * 100) / 100;
}
