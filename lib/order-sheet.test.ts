import assert from "node:assert/strict";
import test from "node:test";
import { findHeader, parseOrderDate, rowsFromMatrix, summarizeOrders } from "./order-sheet";

test("叫貨表欄位不在第一列、單價有逗號、民國日期", () => {
  const matrix = [
    ["封面"],
    ["供應商名稱", "品名", "單位", "單價(元)", "叫貨數量", "叫貨日"],
    ["鮮達蔬果", "高麗菜", "顆", "1,200", "6", "2026-10-01"],
    ["鮮達蔬果", "高麗菜", "顆", "48", "4", "2026/10/08"],
    ["鮮達蔬果", "青蔥", "把", "30元", "3", "114/10/01"],
    ["", "缺廠商", "個", 1, 1, "2026-10-01"],
  ];
  const found = findHeader(matrix);
  assert.equal(found.headerIndex, 1);
  assert.equal(parseOrderDate("114/10/01"), "2025-10-01");
  assert.equal(parseOrderDate(45931), "2025-10-01");
  const parsed = rowsFromMatrix(matrix, found.mapping, found.headerIndex);
  assert.equal(parsed.rows.length, 3);
  assert.equal(parsed.skipped.length, 1);
  const summary = summarizeOrders(parsed.rows);
  const cabbage = summary.vendors[0].items.find((item) => item.name === "高麗菜");
  assert.equal(cabbage?.price, 48);
  assert.equal(cabbage?.suggested, 5);
  assert.equal(summary.months[0].ym, "2025-10");
  assert.equal(summary.orderCount, 3);
});
