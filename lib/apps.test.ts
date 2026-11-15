import assert from "node:assert/strict";
import test from "node:test";
import { dishesOf, draftFromHistory, monthReport, parseOrderSheet, parseSales, replyFor, reviewTags, sampleMenu, sampleOrders, sampleSales } from "./apps";

test("叫貨平常叫是最近次數的平均", () => {
  const parsed = parseOrderSheet(sampleOrders);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const cabbage = parsed.value.draft.find((line) => line.item === "高麗菜");
  assert.equal(cabbage?.suggested, 5);
  assert.equal(cabbage?.price, 48);
  const report = monthReport(parsed.value.history);
  assert.ok(report.some((row) => row.month === "2026-10" && row.vendor === "鮮達蔬果"));
});

test("民國日期進叫貨紀錄", () => {
  const parsed = parseOrderSheet(sampleOrders);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.ok(parsed.value.history.some((line) => line.date === "2025-11-03"));
  assert.equal(draftFromHistory(parsed.value.history).length > 0, true);
});

test("缺少欄位會說欄名", () => {
  const parsed = parseSales([["品項", "數量"], ["麵", 1]]);
  assert.equal(parsed.ok, false);
  if (parsed.ok) return;
  assert.match(parsed.error, /日期/);
});

test("菜單成本與建議售價", () => {
  const rows = [
    { dish: "麵", price: 100, ingredient: "麵條", qty: 1, unitPrice: 40 },
  ];
  const [dish] = dishesOf(rows);
  assert.equal(dish.cost, 40);
  assert.equal(dish.margin, 0.6);
  assert.equal(dish.suggest, 120);
});

test("評論回覆依星等", () => {
  assert.match(replyFor(5), /謝謝/);
  assert.match(replyFor(2), /對不起/);
  assert.deepEqual(reviewTags("湯頭很濃，等太久"), ["湯", "等"]);
});

test("範例檔都能讀", () => {
  assert.equal(parseOrderSheet(sampleOrders).ok, true);
  assert.equal(parseSales(sampleSales).ok, true);
  assert.equal(dishesOf([]).length, 0);
  void sampleMenu;
});
