import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { exampleDelivery, parseMenuCsv, quoteDelivery, roundUpToStep } from "./delivery.ts";

describe("delivery pricing", () => {
  it("backs into a price that protects margin after commission", () => {
    const quote = quoteDelivery(exampleDelivery);
    assert.equal(quote.ok, true);
    if (!quote.ok) return;
    assert.ok(Math.abs(quote.exactPrice - 218.8034188) < 0.01);
    assert.equal(quote.suggestedPrice, 220);
    assert.ok(Math.abs((quote.quote.marginOnNet ?? 0) - 79 / 143) < 0.001);
    assert.ok(quote.inStore);
    assert.ok(Math.abs((quote.inStore?.marginOnNet ?? 0) - 53 / 117) < 0.001);
    assert.ok((quote.inStore?.marginOnNet ?? 1) < exampleDelivery.targetMarginPct / 100);
  });

  it("rounds up to the next 10 dollars and leaves an exact ten alone", () => {
    assert.equal(roundUpToStep(218.8, 10), 220);
    assert.equal(roundUpToStep(220, 10), 220);
  });

  it("rejects an impossible margin", () => {
    const quote = quoteDelivery({ ...exampleDelivery, targetMarginPct: 100 });
    assert.equal(quote.ok, false);
  });

  it("parses a pasted menu and inherits blank commission cells", () => {
    const csv = ["品項,店內售價,食材成本,包材成本,抽成比例", "滷肉飯,70,22,4,", "紅茶,25,4,2,30"].join("\n");
    const parsed = parseMenuCsv(csv, exampleDelivery);
    assert.equal(parsed.items.length, 2);
    assert.equal(parsed.items[0].commissionPct, 35);
    assert.equal(parsed.items[1].commissionPct, 30);
    assert.equal(parsed.items[0].targetMarginPct, 55);
  });

  it("warns when commission looks like a decimal", () => {
    const csv = "品項,店內售價,食材成本,抽成比例\n麵,180,58,0.35";
    const parsed = parseMenuCsv(csv, exampleDelivery);
    assert.equal(parsed.decimalCommissionWarning, true);
  });
});
