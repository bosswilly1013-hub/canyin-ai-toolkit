import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { guessMapping, summarizeDaily, summarizePnl } from "./reports.ts";
import { buildSampleSales, examplePnlRows } from "./sample.ts";

describe("reports", () => {
  it("builds two months and a higher weekend average", () => {
    const rows = buildSampleSales();
    assert.equal(rows.length, 61);
    const summary = summarizeDaily(rows);
    assert.equal(summary.months.length, 2);
    assert.equal(summary.months[0].month, "2026-09");
    assert.equal(summary.months[1].month, "2026-10");
    assert.ok(summary.months[1].revenue > summary.months[0].revenue);
    assert.ok((summary.weekendAvg ?? 0) > (summary.weekdayAvg ?? 0));
    assert.equal(summary.mom.length, 1);
    assert.ok((summary.mom[0].deltaPct ?? 0) > 0);
    const summed = summary.months.reduce((sum, month) => sum + month.revenue, 0);
    assert.equal(summed, summary.revenue);
  });

  it("separates revenue from costs on a profit-and-loss sheet", () => {
    const summary = summarizePnl(examplePnlRows);
    assert.equal(summary.revenue, 980000);
    assert.equal(summary.cost, 857600);
    assert.equal(summary.leftover, 122400);
    assert.equal(summary.costs.some((slice) => slice.label === "營業額"), false);
  });

  it("maps traditional Chinese headers", () => {
    const mapping = guessMapping(["日期", "營業額", "來客數", "食材成本"]);
    assert.equal(mapping.date, 0);
    assert.equal(mapping.revenue, 1);
    assert.equal(mapping.customers, 2);
    assert.equal(mapping.foodCost, 3);
  });
});
