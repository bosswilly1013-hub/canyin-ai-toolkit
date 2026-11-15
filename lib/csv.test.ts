import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseCsv, parseLooseNumber, toCsv } from "./csv.ts";

describe("csv", () => {
  it("parses quotes, commas, and a BOM", () => {
    const rows = parseCsv('\uFEFF品項,備註\n"牛肉麵","有,蔥"\n滷肉飯,""\n');
    assert.deepEqual(rows, [
      ["品項", "備註"],
      ["牛肉麵", "有,蔥"],
      ["滷肉飯", ""],
    ]);
  });

  it("round-trips a comma inside a cell", () => {
    const csv = toCsv([
      ["品項", "備註"],
      ["牛肉麵", "大,小碗"],
    ]);
    assert.equal(csv.charCodeAt(0), 0xfeff);
    assert.deepEqual(parseCsv(csv), [
      ["品項", "備註"],
      ["牛肉麵", "大,小碗"],
    ]);
  });

  it("reads Taiwan-formatted amounts", () => {
    assert.equal(parseLooseNumber("1,234 元"), 1234);
    assert.equal(parseLooseNumber("(20)"), -20);
    assert.equal(parseLooseNumber("abc"), null);
  });
});
