/**
 * Minimal RFC 4180 CSV reader/writer for staff imports and exports (CP-5.4).
 *
 * No dependency: the files we handle are small (capped in the route), and the
 * rules we need are narrow — quoted fields, escaped quotes, CRLF/LF, a BOM, and
 * protection against spreadsheet formula injection on export.
 */

export class CsvError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CsvError';
  }
}

function normalizeCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

/**
 * Prefix a cell that a spreadsheet could execute. docs/API.md §4: prefix cells
 * starting with `=`, `+`, `-` or `@` with an apostrophe.
 */
export function formulaSafe(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function quoteCell(value: string, protectFormula: boolean): string {
  const raw = protectFormula ? formulaSafe(value) : value;
  return /[",\r\n]/.test(raw) ? `"${raw.replaceAll('"', '""')}"` : raw;
}

/** Serialise a header and rows. Always ends with a newline; uses CRLF. */
export function serializeCsv(
  header: readonly string[],
  rows: readonly (readonly unknown[])[],
): string {
  const lines = [
    header.map((cell) => quoteCell(cell, false)).join(','),
    ...rows.map((row) => row.map((cell) => quoteCell(normalizeCell(cell), true)).join(',')),
  ];

  return `${lines.join('\r\n')}\r\n`;
}

/** Parse raw CSV text into a grid of cells. Throws `CsvError` on broken input. */
export function parseCsv(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, '');
  if (!text.trim()) throw new CsvError('The file is empty.');

  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (inQuotes) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      if (field.length > 0) throw new CsvError('Unexpected quote in an unquoted field.');
      inQuotes = true;
    } else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }

  if (inQuotes) throw new CsvError('The file ends inside a quoted field.');
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ''));
}

export type CsvRecord = { rowNumber: number; values: Record<string, string> };

/**
 * Parse CSV into records keyed by a lowercased, trimmed header. `rowNumber` is
 * the 1-based line in the file (header is row 1), which is what row-level error
 * reports show staff.
 */
export function parseCsvRecords(input: string, required: readonly string[]): CsvRecord[] {
  const [headerRow, ...body] = parseCsv(input);
  if (!headerRow) throw new CsvError('The file has no header row.');

  const header = headerRow.map((cell) => cell.trim().toLowerCase());
  if (new Set(header).size !== header.length) {
    throw new CsvError('The header has a duplicate column name.');
  }

  for (const column of required) {
    if (!header.includes(column)) {
      throw new CsvError(`The header is missing the "${column}" column.`);
    }
  }

  return body.map((cells, index) => {
    if (cells.length > header.length) {
      throw new CsvError(`Row ${index + 2} has more cells than the header.`);
    }

    const values: Record<string, string> = {};
    header.forEach((column, columnIndex) => {
      values[column] = (cells[columnIndex] ?? '').trim();
    });

    return { rowNumber: index + 2, values };
  });
}
