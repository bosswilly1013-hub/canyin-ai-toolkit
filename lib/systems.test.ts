import assert from "node:assert/strict";
import test from "node:test";
import { gaps, systems } from "./systems";

test("每一類只有一套，網址不重複", () => {
  const categories = systems.map((system) => system.category);
  assert.equal(new Set(categories).size, categories.length);
  const slugs = [...systems.map((system) => system.slug), ...gaps.map((gap) => gap.slug)];
  assert.equal(new Set(slugs).size, slugs.length);
});

test("Cloud Run 按鈕只放在有 Dockerfile 的倉庫", () => {
  const withButton = systems.filter((system) => system.cloudRunUrl).map((system) => system.slug).sort();
  assert.deepEqual(withButton, ["jianren-promo", "metabase", "moneyprinter", "n8n", "paperless"]);
  assert.equal(systems.find((system) => system.slug === "procurement")?.cloudRunUrl, undefined);
});

test("自製中沒有倉庫", () => {
  assert.equal(gaps.length, 3);
  for (const gap of gaps) assert.equal("repoUrl" in gap, false);
});
