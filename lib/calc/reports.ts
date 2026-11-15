export type DailyRow = {
  date: string;
  revenue: number;
  customers?: number;
  foodCost?: number;
  labor?: number;
  rent?: number;
  utilities?: number;
  otherCost?: number;
  deliveryRevenue?: number;
  dineInRevenue?: number;
};

export type MonthPoint = {
  month: string;
  revenue: number;
  customers: number;
  foodCost: number;
  days: number;
};

export type MomPoint = {
  month: string;
  revenue: number;
  previous: number;
  delta: number;
  deltaPct: number | null;
};

export type CostSlice = { key: string; label: string; amount: number };

export type DailySummary = {
  days: number;
  revenue: number;
  customers: number;
  avgRevenue: number;
  avgCustomers: number | null;
  best: DailyRow | null;
  worst: DailyRow | null;
  foodPct: number | null;
  months: MonthPoint[];
  mom: MomPoint[];
  weekday: { label: string; revenue: number; days: number }[];
  costs: CostSlice[];
  weekendAvg: number | null;
  weekdayAvg: number | null;
};

const weekdayLabels = ["日", "一", "二", "三", "四", "五", "六"];

export function summarizeDaily(rows: DailyRow[]): DailySummary {
  const valid = rows.filter((row) => row.date && Number.isFinite(row.revenue));
  const revenue = valid.reduce((sum, row) => sum + row.revenue, 0);
  const customers = valid.reduce((sum, row) => sum + (row.customers ?? 0), 0);
  const hasCustomers = valid.some((row) => row.customers != null);
  const food = valid.reduce((sum, row) => sum + (row.foodCost ?? 0), 0);
  const hasFood = valid.some((row) => row.foodCost != null);
  const sorted = [...valid].sort((a, b) => a.revenue - b.revenue);

  const monthMap = new Map<string, MonthPoint>();
  const weekday = weekdayLabels.map((label) => ({ label, revenue: 0, days: 0 }));
  let weekendRevenue = 0;
  let weekendDays = 0;
  let weekdayRevenue = 0;
  let weekdayDays = 0;

  for (const row of valid) {
    const month = row.date.slice(0, 7);
    const point = monthMap.get(month) ?? { month, revenue: 0, customers: 0, foodCost: 0, days: 0 };
    point.revenue += row.revenue;
    point.customers += row.customers ?? 0;
    point.foodCost += row.foodCost ?? 0;
    point.days += 1;
    monthMap.set(month, point);
    const date = new Date(`${row.date}T00:00:00Z`);
    const day = date.getUTCDay();
    if (!Number.isNaN(day)) {
      weekday[day].revenue += row.revenue;
      weekday[day].days += 1;
      if (day === 0 || day === 6) {
        weekendRevenue += row.revenue;
        weekendDays += 1;
      } else {
        weekdayRevenue += row.revenue;
        weekdayDays += 1;
      }
    }
  }

  const months = [...monthMap.values()].sort((a, b) => a.month.localeCompare(b.month));
  const mom: MomPoint[] = months.slice(1).map((month, index) => {
    const previous = months[index].revenue;
    const delta = month.revenue - previous;
    return {
      month: month.month,
      revenue: month.revenue,
      previous,
      delta,
      deltaPct: previous > 0 ? delta / previous : null,
    };
  });

  const costDefs: { key: keyof DailyRow; label: string }[] = [
    { key: "foodCost", label: "食材" },
    { key: "labor", label: "人事" },
    { key: "rent", label: "租金" },
    { key: "utilities", label: "水電" },
    { key: "otherCost", label: "其他" },
  ];
  const costs: CostSlice[] = costDefs
    .map((def) => ({
      key: def.key,
      label: def.label,
      amount: valid.reduce((sum, row) => sum + (Number(row[def.key]) || 0), 0),
    }))
    .filter((slice) => slice.amount > 0);

  return {
    days: valid.length,
    revenue,
    customers,
    avgRevenue: valid.length ? revenue / valid.length : 0,
    avgCustomers: hasCustomers && valid.length ? customers / valid.length : null,
    best: sorted.at(-1) ?? null,
    worst: sorted[0] ?? null,
    foodPct: hasFood && revenue > 0 ? food / revenue : null,
    months,
    mom,
    weekday,
    costs,
    weekendAvg: weekendDays ? weekendRevenue / weekendDays : null,
    weekdayAvg: weekdayDays ? weekdayRevenue / weekdayDays : null,
  };
}

export type PnlLine = { label: string; amount: number; kind: "revenue" | "cost" };

export type PnlSummary = {
  revenue: number;
  cost: number;
  leftover: number;
  lines: PnlLine[];
  costs: CostSlice[];
};

const revenuePattern = /營業額|營收|銷售額|收入/;

export function summarizePnl(lines: { label: string; amount: number }[]): PnlSummary {
  const tagged: PnlLine[] = lines
    .filter((line) => line.label.trim() && Number.isFinite(line.amount))
    .map((line) => ({
      label: line.label.trim(),
      amount: line.amount,
      kind: revenuePattern.test(line.label) ? "revenue" : "cost",
    }));
  const revenue = tagged.filter((line) => line.kind === "revenue").reduce((sum, line) => sum + line.amount, 0);
  const costLines = tagged.filter((line) => line.kind === "cost" && line.amount !== 0);
  const cost = costLines.reduce((sum, line) => sum + line.amount, 0);
  return {
    revenue,
    cost,
    leftover: revenue - cost,
    lines: tagged,
    costs: costLines.map((line) => ({ key: line.label, label: line.label, amount: line.amount })),
  };
}

export type ColumnRole =
  | "date"
  | "revenue"
  | "customers"
  | "foodCost"
  | "labor"
  | "rent"
  | "utilities"
  | "otherCost"
  | "deliveryRevenue"
  | "dineInRevenue"
  | "label"
  | "amount";

export const columnRoles: { role: ColumnRole; label: string }[] = [
  { role: "date", label: "日期" },
  { role: "revenue", label: "營業額" },
  { role: "customers", label: "來客數" },
  { role: "foodCost", label: "食材成本" },
  { role: "labor", label: "人事" },
  { role: "rent", label: "租金" },
  { role: "utilities", label: "水電" },
  { role: "otherCost", label: "其他成本" },
  { role: "deliveryRevenue", label: "外送營業額" },
  { role: "dineInRevenue", label: "內用營業額" },
  { role: "label", label: "科目" },
  { role: "amount", label: "金額" },
];

const aliases: Record<ColumnRole, string[]> = {
  date: ["日期", "營業日", "date", "day"],
  revenue: ["營業額", "營收", "銷售額", "收入", "revenue", "sales"],
  customers: ["來客數", "客數", "人數", "customers", "guests"],
  foodCost: ["食材成本", "食物成本", "食材", "foodcost", "food_cost", "cogs"],
  labor: ["人事成本", "人事", "薪資", "labor", "wages"],
  rent: ["租金", "房租", "rent"],
  utilities: ["水電瓦斯", "水電", "utilities"],
  otherCost: ["其他成本", "其他", "other"],
  deliveryRevenue: ["外送營業額", "外送", "delivery"],
  dineInRevenue: ["內用營業額", "內用", "dinein"],
  label: ["科目", "項目", "account"],
  amount: ["金額", "amount"],
};

function norm(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export function guessMapping(headers: string[]): Partial<Record<ColumnRole, number>> {
  const mapping: Partial<Record<ColumnRole, number>> = {};
  const used = new Set<number>();
  (Object.keys(aliases) as ColumnRole[]).forEach((role) => {
    const index = headers.findIndex((header, headerIndex) => {
      if (used.has(headerIndex)) return false;
      const key = norm(header);
      return aliases[role].some((alias) => key === norm(alias));
    });
    if (index >= 0) {
      mapping[role] = index;
      used.add(index);
    }
  });
  return mapping;
}

export function excelSerialToIso(serial: number): string {
  const utc = new Date(Date.UTC(1899, 11, 30) + Math.round(serial) * 86400000);
  return utc.toISOString().slice(0, 10);
}

export function parseDateCell(value: string): string | null {
  const text = value.trim();
  if (!text) return null;
  const iso = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (iso) {
    const month = iso[2].padStart(2, "0");
    const day = iso[3].padStart(2, "0");
    return `${iso[1]}-${month}-${day}`;
  }
  const numeric = Number(text);
  if (Number.isFinite(numeric) && numeric > 20000 && numeric < 80000) return excelSerialToIso(numeric);
  return null;
}
