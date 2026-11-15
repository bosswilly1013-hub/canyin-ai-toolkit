import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkAisles, exampleFloor } from "./floor.ts";

describe("floor aisles", () => {
  it("accepts the example shop", () => {
    const report = checkAisles(exampleFloor());
    assert.deepEqual(report.issues, []);
    assert.ok(report.narrowest);
    assert.ok((report.narrowest?.gapM ?? 0) >= 0.75);
  });

  it("flags overlapping tables and a narrow aisle", () => {
    const state = exampleFloor();
    state.items = [
      { id: "a", kind: "table4", name: "甲", x: 0, y: 0, w: 1.6, h: 1.6 },
      { id: "b", kind: "table4", name: "乙", x: 1.5, y: 0.2, w: 1.6, h: 1.6 },
      { id: "c", kind: "table2", name: "丙", x: 0, y: 2.0, w: 1.2, h: 1.2 },
    ];
    const report = checkAisles({ ...state, widthM: 6, depthM: 6 });
    assert.ok(report.issues.some((issue) => issue.level === "overlap"));
  });

  it("ignores a diagonal gap that is not a shared aisle", () => {
    const report = checkAisles({
      widthM: 6,
      depthM: 6,
      items: [
        { id: "a", kind: "table2", name: "甲", x: 0, y: 0, w: 1.2, h: 1.2 },
        { id: "b", kind: "table2", name: "乙", x: 3, y: 3, w: 1.2, h: 1.2 },
      ],
    });
    assert.equal(report.narrowest, null);
    assert.deepEqual(report.issues, []);
  });
});
