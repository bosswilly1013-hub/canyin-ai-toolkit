export type TargetInput = {
  monthlyTarget: number;
  weekdays: number;
  weekendDays: number;
  /** A weekend day is this many times a weekday. 1.45 means +45%. */
  weekendRatio: number;
  avgTicket: number;
  lunchPct: number;
  dinnerPct: number;
  otherPct: number;
  returningPct: number;
  referralPct: number;
  newPct: number;
};

export type DaySplit = {
  revenue: number;
  customers: number | null;
};

export type TargetResult = {
  weekday: DaySplit;
  weekend: DaySplit;
  monthlyCustomers: number | null;
  mealsOk: boolean;
  mealSum: number;
  mixOk: boolean;
  mixSum: number;
  meals: { key: string; label: string; pct: number; weekday: DaySplit; weekend: DaySplit }[];
  mix: { key: string; label: string; pct: number; customers: number | null }[];
  checkRevenue: number;
};

export const exampleTargets: TargetInput = {
  monthlyTarget: 500000,
  weekdays: 22,
  weekendDays: 8,
  weekendRatio: 1.45,
  avgTicket: 220,
  lunchPct: 45,
  dinnerPct: 50,
  otherPct: 5,
  returningPct: 55,
  referralPct: 15,
  newPct: 30,
};

function daySplit(revenue: number, ticket: number): DaySplit {
  return { revenue, customers: ticket > 0 ? revenue / ticket : null };
}

export function splitTarget(input: TargetInput): TargetResult | { error: string } {
  if (input.monthlyTarget < 0) return { error: "月目標不能是負的。" };
  if (input.weekdays < 0 || input.weekendDays < 0) return { error: "天數不能是負的。" };
  if (input.weekdays + input.weekendDays <= 0) return { error: "平日和週末至少要有一天營業。" };
  if (input.weekendRatio <= 0) return { error: "週末倍率要大於 0。1 代表週末和平日一樣。" };

  const weight = input.weekdays + input.weekendRatio * input.weekendDays;
  const weekdayRevenue = input.monthlyTarget / weight;
  const weekendRevenue = weekdayRevenue * input.weekendRatio;
  const weekday = daySplit(weekdayRevenue, input.avgTicket);
  const weekend = daySplit(weekendRevenue, input.avgTicket);
  const monthlyCustomers = input.avgTicket > 0 ? input.monthlyTarget / input.avgTicket : null;
  const mealSum = input.lunchPct + input.dinnerPct + input.otherPct;
  const mixSum = input.returningPct + input.referralPct + input.newPct;
  const mealsOk = Math.abs(mealSum - 100) < 0.11;
  const mixOk = Math.abs(mixSum - 100) < 0.11;

  const mealDefs = [
    { key: "lunch", label: "午餐", pct: input.lunchPct },
    { key: "dinner", label: "晚餐", pct: input.dinnerPct },
    { key: "other", label: "其他時段", pct: input.otherPct },
  ];
  const mixDefs = [
    { key: "returning", label: "回購", pct: input.returningPct },
    { key: "referral", label: "介紹", pct: input.referralPct },
    { key: "new", label: "新客", pct: input.newPct },
  ];

  return {
    weekday,
    weekend,
    monthlyCustomers,
    mealsOk,
    mealSum,
    mixOk,
    mixSum,
    meals: mealDefs.map((meal) => ({
      ...meal,
      weekday: daySplit(weekdayRevenue * (meal.pct / 100), input.avgTicket),
      weekend: daySplit(weekendRevenue * (meal.pct / 100), input.avgTicket),
    })),
    mix: mixDefs.map((part) => ({
      ...part,
      customers: monthlyCustomers == null ? null : monthlyCustomers * (part.pct / 100),
    })),
    checkRevenue: weekdayRevenue * input.weekdays + weekendRevenue * input.weekendDays,
  };
}
