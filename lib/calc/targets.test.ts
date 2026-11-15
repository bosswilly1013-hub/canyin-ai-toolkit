import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { exampleTargets, splitTarget } from "./targets.ts";

describe("target split", () => {
  it("splits the month into weekdays and weekends that add back up", () => {
    const result = splitTarget(exampleTargets);
    assert.ok(!("error" in result));
    if ("error" in result) return;
    assert.ok(Math.abs(result.weekday.revenue - 14880.95238095) < 0.01);
    assert.ok(Math.abs(result.weekend.revenue - 21577.38095238) < 0.01);
    assert.ok(Math.abs(result.checkRevenue - 500000) < 0.01);
    assert.ok(Math.abs((result.monthlyCustomers ?? 0) - 2272.727272) < 0.01);
    const lunch = result.meals.find((meal) => meal.key === "lunch");
    assert.ok(lunch);
    assert.ok(Math.abs(lunch.weekday.revenue - result.weekday.revenue * 0.45) < 0.01);
    const fresh = result.mix.find((part) => part.key === "new");
    assert.ok(Math.abs((fresh?.customers ?? 0) - 681.818181) < 0.01);
  });

  it("still splits the day when meal percents are not 100, using their ratio", () => {
    const result = splitTarget({ ...exampleTargets, otherPct: 0 });
    assert.ok(!("error" in result));
    if ("error" in result) return;
    assert.equal(result.mealsOk, false);
    assert.equal(result.mealSum, 95);
    const lunch = result.meals.find((meal) => meal.key === "lunch");
    assert.ok(lunch);
    assert.ok(Math.abs(lunch.weekday.revenue - result.weekday.revenue * (45 / 95)) < 0.01);
    const share = result.meals.reduce((sum, meal) => sum + meal.weekday.revenue, 0);
    assert.ok(Math.abs(share - result.weekday.revenue) < 0.01);
  });
});
