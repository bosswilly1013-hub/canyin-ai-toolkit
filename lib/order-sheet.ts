export type OrderField = "vendor" | "item" | "unit" | "price" | "qty" | "date";

export type ColumnMapping = Record<OrderField, number>;

export type OrderRow = {
  line: number;
  vendor: string;
  item: string;
  unit: string;
  price: number;
  qty: number;
  date: string;
  dateWarning: boolean;
};

export type OrderPreview = {
  vendors: { name: string; items: { name: string; unit: string; price: number; suggested: number }[] }[];
  months: { ym: string; cost: number }[];
  orderCount: number;
  rowCount: number;
  skipped: { line: number; reason: string }[];
};

const fields: OrderField[] = ["vendor", "item", "unit", "price", "qty", "date"];

const aliases: Record<OrderField, string[]> = {
  vendor: ["廠商", "供應商", "廠商名稱", "供應商名稱", "叫貨廠商", "vendor", "supplier"],
  item: ["品項", "品名", "品項名稱", "商品名稱", "商品", "名稱", "item", "name"],
  unit: ["單位", "unit"],
  price: ["單價", "價格", "參考價", "進價", "售價", "price", "cost"],
  qty: ["數量", "叫貨量", "叫貨數量", "訂貨量", "qty", "quantity"],
  date: ["日期", "叫貨日", "訂貨日", "下單日", "進貨日", "date"],
};

export function normHeader(value: unknown): string {
  return String(value ?? "")
    .replace(/^\uFEFF/, "")
    .replace(/[\s\u3000]/g, "")
    .replace(/[（(][^）)]*[）)]/g, "")
    .toLowerCase();
}

export function emptyMapping(): ColumnMapping {
  return { vendor: -1, item: -1, unit: -1, price: -1, qty: -1, date: -1 };
}

export function detectColumns(headers: unknown[]): ColumnMapping {
  const used = new Set<number>();
  const mapping = emptyMapping();
  for (const field of fields) {
    const names = new Set(aliases[field].map(normHeader));
    const index = headers.findIndex((header, i) => !used.has(i) && names.has(normHeader(header)));
    if (index >= 0) {
      mapping[field] = index;
      used.add(index);
    }
  }
  return mapping;
}

export function findHeader(matrix: unknown[][]): { headerIndex: number; headers: string[]; mapping: ColumnMapping } {
  const limit = Math.min(matrix.length, 15);
  for (let i = 0; i < limit; i++) {
    const headers = (matrix[i] || []).map((cell) => String(cell ?? "").trim());
    const mapping = detectColumns(headers);
    if (mapping.vendor >= 0 && mapping.item >= 0) return { headerIndex: i, headers, mapping };
  }
  const width = Math.max(0, ...matrix.slice(0, 15).map((row) => (row || []).length));
  return {
    headerIndex: -1,
    headers: Array.from({ length: width }, (_, index) => `第 ${index + 1} 欄`),
    mapping: emptyMapping(),
  };
}

export function parseLooseOrderNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const trimmed = String(value ?? "")
    .trim()
    .replace(/[元$＄]/g, "")
    .replace(/[,，\s]/g, "");
  if (!trimmed) return 0;
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function ymd(year: number, month: number, day: number): string {
  if (year < 2000 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return "";
  const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const date = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === iso ? iso : "";
}

export function parseOrderDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return ymd(value.getFullYear(), value.getMonth() + 1, value.getDate());
  if (typeof value === "number" && value > 20000 && value < 80000) {
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    return ymd(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
  }
  const text = String(value ?? "").trim();
  if (!text) return "";
  const compact = text.replace(/[年月./]/g, "-").replace(/日/g, "").replace(/\//g, "-");
  let match = compact.match(/^(\d{2,4})-(\d{1,2})-(\d{1,2})/);
  if (!match && /^\d{8}$/.test(text)) match = text.match(/^(\d{4})(\d{2})(\d{2})/);
  if (!match) return "";
  let year = Number(match[1]);
  if (year < 1911) year += 1911;
  return ymd(year, Number(match[2]), Number(match[3]));
}

export function rowsFromMatrix(matrix: unknown[][], mapping: ColumnMapping, headerIndex: number): { rows: OrderRow[]; skipped: { line: number; reason: string }[] } {
  const rows: OrderRow[] = [];
  const skipped: { line: number; reason: string }[] = [];
  matrix.forEach((raw, index) => {
    if (index <= headerIndex) return;
    const line = index + 1;
    const source = Array.isArray(raw) ? raw : [];
    if (source.every((value) => String(value ?? "").trim() === "")) return;
    const vendor = String(mapping.vendor < 0 ? "" : (source[mapping.vendor] ?? "")).trim().slice(0, 80);
    const item = String(mapping.item < 0 ? "" : (source[mapping.item] ?? "")).trim().slice(0, 100);
    if (!vendor || !item) {
      skipped.push({ line, reason: !vendor ? "沒有廠商" : "沒有品項" });
      return;
    }
    const price = parseLooseOrderNumber(mapping.price < 0 ? "" : source[mapping.price]);
    const qty = parseLooseOrderNumber(mapping.qty < 0 ? "" : source[mapping.qty]);
    if (price == null || qty == null || price < 0 || price > 10000000 || qty < 0 || qty > 100000) {
      skipped.push({ line, reason: "單價或數量看不懂" });
      return;
    }
    const dateText = String(mapping.date < 0 ? "" : (source[mapping.date] ?? "")).trim();
    const date = mapping.date < 0 ? "" : parseOrderDate(source[mapping.date]);
    rows.push({
      line,
      vendor,
      item,
      unit: String(mapping.unit < 0 ? "" : (source[mapping.unit] ?? "")).trim().slice(0, 20),
      price: Math.round(price * 100) / 100,
      qty: Math.round(qty * 1000) / 1000,
      date,
      dateWarning: dateText !== "" && !date,
    });
  });
  return { rows: rows.slice(0, 8000), skipped };
}

export function summarizeOrders(rows: OrderRow[]): OrderPreview {
  const vendors = new Map<string, { name: string; items: Map<string, { name: string; unit: string; price: number; priceDate: string; samples: { date: string; qty: number }[] }> }>();
  const months = new Map<string, number>();
  const orderKeys = new Set<string>();
  for (const row of rows) {
    const vendor = vendors.get(row.vendor) ?? { name: row.vendor, items: new Map() };
    vendors.set(row.vendor, vendor);
    const item = vendor.items.get(row.item) ?? { name: row.item, unit: "", price: 0, priceDate: "", samples: [] };
    if (row.unit) item.unit = row.unit;
    if (!item.priceDate || (row.date && row.date >= item.priceDate)) {
      item.price = row.price;
      item.priceDate = row.date || item.priceDate;
    }
    if (row.date && row.qty > 0) item.samples.push({ date: row.date, qty: row.qty });
    vendor.items.set(row.item, item);
    if (row.date && row.qty > 0) {
      orderKeys.add(`${row.date}\0${row.vendor}`);
      const month = row.date.slice(0, 7);
      months.set(month, Math.round(((months.get(month) || 0) + row.qty * row.price) * 100) / 100);
    }
  }
  return {
    vendors: [...vendors.values()].map((vendor) => ({
      name: vendor.name,
      items: [...vendor.items.values()].map((item) => {
        const byDate = new Map<string, number>();
        for (const sample of item.samples) byDate.set(sample.date, Math.round(((byDate.get(sample.date) || 0) + sample.qty) * 1000) / 1000);
        const recent = [...byDate.keys()].sort().reverse().slice(0, 8);
        const suggested = recent.length ? Math.round((recent.reduce((sum, date) => sum + (byDate.get(date) || 0), 0) / recent.length) * 10) / 10 : 0;
        return { name: item.name, unit: item.unit, price: item.price, suggested };
      }),
    })),
    months: [...months.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([ym, cost]) => ({ ym, cost })),
    orderCount: orderKeys.size,
    rowCount: rows.length,
    skipped: [],
  };
}

export const sampleOrderRows: (string | number)[][] = [
  ["廠商", "品項", "單位", "單價", "數量", "日期"],
  ["鮮達蔬果", "高麗菜", "顆", 45, 6, "2026-10-01"],
  ["鮮達蔬果", "青蔥", "把", 30, 3, "2026-10-01"],
  ["大成肉品", "雞腿排", "公斤", 95, 8, "2026-10-01"],
  ["鮮達蔬果", "高麗菜", "顆", 48, 4, "2026-10-08"],
  ["大成肉品", "雞腿排", "公斤", 98, 6, "2026-10-08"],
  ["鮮達蔬果", "高麗菜", "顆", 50, 5, "2026-11-03"],
  ["海鮮行", "白蝦", "台斤", 180, 2, "2026-11-05"],
];
