import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzeBreakEven, breakEvenProblem, exampleBreakEven, type BreakEvenInput } from "./break-even.ts";

function close(actual: number | null, expected: number) {
  assert.ok(actual != null);
  assert.ok(Math.abs(actual - expected) < 0.02, `${actual} !~ ${expected}`);
}

describe("break-even", () => {
  it("prices the example noodle shop and shows that a discount needs more guests", () => {
    const result = analyzeBreakEven(exampleBreakEven);
    assert.equal(result.fixed, 244000);
    close(result.variablePerGuest, 70.4);
    close(result.base.monthlyRevenue, 358823.53);
    close(result.base.customersPerDay, 62.73);
    close(result.selected.customersPerDay, 73.55);
    close(result.selected.monthlyRevenue, 378620.69);
    close(result.selected.extraCustomersPerDay, 10.82);
    close(result.base.monthlyProfitAtExpected, 28272);
    close(result.selected.monthlyProfitAtExpected, -11768);
  });

  it("matches a second shop calculated by hand", () => {
    const input: BreakEvenInput = {
      rent: 60000,
      labor: 120000,
      utilities: 10000,
      otherFixed: 10000,
      variablePct: 30,
      avgTicket: 200,
      openDays: 25,
      discountPct: 0,
      expectedCustomersPerDay: 0,
    };
    const plain = analyzeBreakEven(input);
    close(plain.base.monthlyRevenue, 285714.29);
    close(plain.base.customersPerDay, 57.14);
    const discounted = analyzeBreakEven({ ...input, discountPct: 10 });
    close(discounted.selected.monthlyRevenue, 300000);
    close(discounted.selected.customersPerDay, 66.67);
  });

  it("explains a negative rent instead of shrinking fixed costs quietly", () => {
    const message = breakEvenProblem({ ...exampleBreakEven, rent: -5000 });
    assert.match(message ?? "", /不能填負數/);
  });

  it("has no break-even when the discount wipes out the contribution", () => {
    const result = analyzeBreakEven({ ...exampleBreakEven, discountPct: 90 });
    assert.equal(result.selected.customersPerDay, null);
    assert.ok((result.selected.contributionPerGuest ?? 0) < 0);
  });
});
