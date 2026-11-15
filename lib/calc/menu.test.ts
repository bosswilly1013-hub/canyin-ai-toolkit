import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { classifyMenu, costDish, exampleDishes } from "./menu.ts";

describe("menu engineering", () => {
  it("costs the beef noodle from its ingredients", () => {
    const cost = costDish(exampleDishes[0]);
    assert.ok(Math.abs(cost.foodCost - 58.2) < 0.001);
    assert.ok(Math.abs(cost.margin - 121.8) < 0.001);
  });

  it("splits the example menu into four quadrants against the average", () => {
    const result = classifyMenu(exampleDishes);
    assert.ok(result);
    const byName = Object.fromEntries(result.rows.map((row) => [row.name, row.quadrant]));
    assert.equal(byName["紅燒牛肉麵"], "star");
    assert.equal(byName["滷肉飯"], "plowhorse");
    assert.equal(byName["半筋半肉麵"], "puzzle");
    assert.equal(byName["小菜拼盤"], "dog");
    assert.equal(byName["紅茶"], "plowhorse");
  });

  it("skips quadrants until a dish has a sales quantity", () => {
    const only = exampleDishes.map((dish) => ({ ...dish, monthlyQty: null }));
    assert.equal(classifyMenu(only), null);
  });
});
