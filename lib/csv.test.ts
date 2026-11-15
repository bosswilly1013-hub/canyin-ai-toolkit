import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { decodeCsvBytes, parseCsv, parseLooseNumber, toCsv } from "./csv.ts";

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
    assert.equal(parseLooseNumber("100,000"), 100000);
    assert.equal(parseLooseNumber("48，000"), 48000);
    assert.equal(parseLooseNumber("35%"), 35);
    assert.equal(parseLooseNumber("(20)"), -20);
    assert.equal(parseLooseNumber("abc"), null);
  });

  it("decodes a Big5 csv that is not valid UTF-8", () => {
    const bytes = new Uint8Array([
      171, 126, 182, 181, 44, 169, 177, 164, 186, 176, 226, 187, 249, 10, 164, 251, 166, 215, 196, 209, 44, 49, 56,
      48, 10,
    ]);
    const decoded = decodeCsvBytes(bytes);
    assert.equal(decoded.encoding, "big5");
    assert.equal(decoded.text.includes("牛肉麵"), true);
    assert.equal(decoded.text.includes("品項"), true);
  });
});
