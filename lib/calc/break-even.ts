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
