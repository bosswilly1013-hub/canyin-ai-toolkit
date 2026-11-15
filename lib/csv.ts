export function parseCsv(text: string): string[][] {
  const src = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < src.length; i++) {
    const char = src[i];
    if (inQuotes) {
      if (char === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(cell.trim());
      cell = "";
    } else if (char === "\n") {
      row.push(cell.trim());
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell.trim());
  if (row.some((value) => value !== "")) rows.push(row);
  return rows;
}

function escapeCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function toCsv(rows: (string | number)[][]): string {
  const body = rows.map((row) => row.map((cell) => escapeCell(String(cell))).join(",")).join("\r\n");
  return `\uFEFF${body}`;
}

export function parseLooseNumber(value: string): number | null {
  const trimmed = value.trim().replace(/[元$＄]/g, "").replace(/[,，\s]/g, "");
  if (!trimmed || trimmed === "-") return null;
  const negative = /^\(.*\)$/.test(trimmed);
  const numeric = negative ? trimmed.slice(1, -1) : trimmed;
  const parsed = Number(numeric);
  if (!Number.isFinite(parsed)) return null;
  return negative ? -parsed : parsed;
}
