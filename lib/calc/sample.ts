import type { DailyRow } from "@/lib/calc/reports";

function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** September and October 2026 for the example noodle shop. Deterministic. */
export function buildSampleSales(): DailyRow[] {
  const random = mulberry32(20260901);
  const rows: DailyRow[] = [];
  const cursor = new Date(Date.UTC(2026, 8, 1));
  const end = new Date(Date.UTC(2026, 10, 1));
  while (cursor < end) {
    const day = cursor.getUTCDay();
    let base = 14500;
    if (day === 0) base = 20000;
    else if (day === 6) base = 22000;
    else if (day === 5) base = 17000;
    else if (day === 1) base = 13200;
    const boost = cursor.getUTCMonth() === 9 ? 1.06 : 1;
    const revenue = Math.round(base * boost * (0.94 + random() * 0.12));
    const ticket = 200 + random() * 40;
    const customers = Math.max(1, Math.round(revenue / ticket));
    const foodCost = Math.round(revenue * (0.3 + random() * 0.04));
    rows.push({
      date: cursor.toISOString().slice(0, 10),
      revenue,
      customers,
      foodCost,
      labor: 5200,
      rent: 1600,
      utilities: Math.round(500 + random() * 200),
      otherCost: 700,
      deliveryRevenue: Math.round(revenue * (0.22 + random() * 0.08)),
      dineInRevenue: 0,
    });
    const last = rows[rows.length - 1];
    last.dineInRevenue = last.revenue - (last.deliveryRevenue ?? 0);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return rows;
}

export const examplePnlRows: { label: string; amount: number }[] = [
  { label: "營業額", amount: 980000 },
  { label: "食材成本", amount: 313600 },
  { label: "包材", amount: 28000 },
  { label: "平台抽成", amount: 42000 },
  { label: "人事", amount: 312000 },
  { label: "租金", amount: 96000 },
  { label: "水電瓦斯", amount: 36000 },
  { label: "行銷", amount: 12000 },
  { label: "其他", amount: 18000 },
];

export const dailyTemplateHeaders = [
  "日期",
  "營業額",
  "來客數",
  "食材成本",
  "人事成本",
  "租金",
  "水電",
  "其他成本",
  "外送營業額",
  "內用營業額",
];
