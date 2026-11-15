import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzeBreakEven, exampleBreakEven } from "./break-even.ts";

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

  it("has no break-even when the discount wipes out the contribution", () => {
    const result = analyzeBreakEven({ ...exampleBreakEven, discountPct: 90 });
    assert.equal(result.selected.customersPerDay, null);
    assert.ok((result.selected.contributionPerGuest ?? 0) < 0);
  });
});
