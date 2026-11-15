export type BreakEvenInput = {
  rent: number;
  labor: number;
  utilities: number;
  otherFixed: number;
  /** Food and packaging as a percent of the in-store ticket, 0–100. */
  variablePct: number;
  avgTicket: number;
  openDays: number;
  /** Percent off the ticket. Food cost does not shrink with the discount. */
  discountPct: number;
  expectedCustomersPerDay: number;
};

export type DiscountScenario = {
  discountPct: number;
  ticket: number;
  contributionPerGuest: number;
  customersPerMonth: number | null;
  customersPerDay: number | null;
  extraCustomersPerDay: number | null;
  monthlyRevenue: number | null;
  monthlyProfitAtExpected: number | null;
};

export type BreakEvenResult = {
  fixed: number;
  variablePerGuest: number;
  base: DiscountScenario;
  selected: DiscountScenario;
  table: DiscountScenario[];
};

export const exampleBreakEven: BreakEvenInput = {
  rent: 48000,
  labor: 156000,
  utilities: 18000,
  otherFixed: 22000,
  variablePct: 32,
  avgTicket: 220,
  openDays: 26,
  discountPct: 10,
  expectedCustomersPerDay: 70,
};

export function fixedCost(input: BreakEvenInput): number {
  return input.rent + input.labor + input.utilities + input.otherFixed;
}

/** Why this input cannot produce a break-even, in plain Chinese. Null means it can. */
export function breakEvenProblem(input: BreakEvenInput): string | null {
  if ([input.rent, input.labor, input.utilities, input.otherFixed].some((n) => n < 0)) {
    return "房租、人事、水電、其他不能填負數。負數會把固定成本越算越小。";
  }
  if (input.variablePct < 0 || input.variablePct > 100) {
    return "變動成本比例要在 0% 到 100% 之間。超過 100% 代表食材比售價還貴。";
  }
  if (input.discountPct < 0 || input.discountPct > 100) {
    return "折扣要在 0% 到 100% 之間。10 代表打九折，100 代表免費送。";
  }
  if (input.avgTicket < 0) return "客單價不能是負的。";
  if (input.avgTicket === 0) return "客單價是 0，沒辦法算來客數。請填平均一位客人付多少錢。";
  if (input.openDays <= 0) return "營業天數至少 1 天。0 天沒有兩平點。";
  if (input.openDays > 31) return "這裡是一個月的算法，營業天數不會超過 31。";
  if (input.expectedCustomersPerDay < 0) return "預估來客數不能是負的。";
  if (fixedCost(input) <= 0) return "固定成本是 0。請把房租和人事填上，不然每一筆營業看起來都像已經打平。";
  const variablePerGuest = input.avgTicket * (input.variablePct / 100);
  const ticket = input.avgTicket * (1 - input.discountPct / 100);
  if (ticket - variablePerGuest <= 0) {
    return "打折後客人付的錢，已經少於或等於食材成本，一位客人都在虧食材，沒有兩平點。先調高售價或降低食材比。";
  }
  return null;
}

function scenarioAt(
  input: BreakEvenInput,
  discountPct: number,
  baseCustomersPerDay: number | null,
): DiscountScenario {
  const fixed = fixedCost(input);
  const variablePerGuest = input.avgTicket * (input.variablePct / 100);
  const ticket = input.avgTicket * (1 - discountPct / 100);
  const contributionPerGuest = ticket - variablePerGuest;
  const expectedMonth = input.expectedCustomersPerDay * input.openDays;
  const empty: DiscountScenario = {
    discountPct,
    ticket,
    contributionPerGuest,
    customersPerMonth: null,
    customersPerDay: null,
    extraCustomersPerDay: null,
    monthlyRevenue: null,
    monthlyProfitAtExpected:
      input.openDays > 0 && Number.isFinite(expectedMonth)
        ? expectedMonth * contributionPerGuest - fixed
        : null,
    };

  if (contributionPerGuest <= 0 || input.openDays <= 0 || input.avgTicket <= 0) {
    return empty;
  }

  const customersPerMonth = fixed / contributionPerGuest;
  const customersPerDay = customersPerMonth / input.openDays;
  return {
    discountPct,
    ticket,
    contributionPerGuest,
    customersPerMonth,
    customersPerDay,
    extraCustomersPerDay:
      baseCustomersPerDay == null ? null : customersPerDay - baseCustomersPerDay,
    monthlyRevenue: customersPerMonth * ticket,
    monthlyProfitAtExpected: expectedMonth * contributionPerGuest - fixed,
  };
}

export function analyzeBreakEven(input: BreakEvenInput): BreakEvenResult {
  const base = scenarioAt(input, 0, null);
  const baseDaily = base.customersPerDay;
  const selected = scenarioAt(input, input.discountPct, baseDaily);
  const withBaseDaily = scenarioAt(input, 0, baseDaily);
  const presets = [0, 5, 10, 15, 20];
  if (Number.isFinite(input.discountPct) && !presets.includes(input.discountPct)) {
    presets.push(input.discountPct);
  }
  presets.sort((a, b) => a - b);
  return {
    fixed: fixedCost(input),
    variablePerGuest: input.avgTicket * (input.variablePct / 100),
    base: withBaseDaily,
    selected,
    table: presets.map((discount) => scenarioAt(input, discount, baseDaily)),
  };
}
