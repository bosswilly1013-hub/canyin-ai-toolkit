"use client";

import { useMemo, useState } from "react";
import {
  deliveryTemplateRows,
  exampleDelivery,
  parseMenuCsv,
  parseMenuTable,
  quoteDelivery,
  type DeliveryInput,
} from "@/lib/calc/delivery";
import { decodeCsvBytes, toCsv } from "@/lib/csv";
import { downloadText, downloadXlsx } from "@/lib/download";
import { ntd, num, pct } from "@/lib/format";
import { usePersisted } from "@/lib/storage";
import { NumberField } from "@/components/number-field";
import { Callout, Explain, Stat, StorageNote } from "@/components/tool-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type DeliveryState = { single: DeliveryInput; batchText: string };

const initial: DeliveryState = {
  single: exampleDelivery,
  batchText: toCsv(deliveryTemplateRows).replace(/^\uFEFF/, ""),
};

export function DeliveryTool() {
  const { value, setValue, reset, fromStorage } = usePersisted("lazykit.v1.delivery", initial);
  const single = value.single;
  const [fileName, setFileName] = useState("");
  const [encodingNote, setEncodingNote] = useState("");
  const quote = quoteDelivery(single);
  const parsed = useMemo(() => parseMenuCsv(value.batchText, single), [value.batchText, single]);

  function setSingle<K extends keyof DeliveryInput>(key: K, next: DeliveryInput[K]) {
    setValue({ ...value, single: { ...single, [key]: next } });
  }

  async function onFile(file: File) {
    setFileName(file.name);
    setEncodingNote("");
    const name = file.name.toLowerCase();
    if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
      const XLSX = await import("xlsx");
      const book = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheet = book.Sheets[book.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" }) as string[][];
      const table = parseMenuTable(rows.map((row) => row.map((cell) => String(cell ?? ""))), single);
      const header = deliveryTemplateRows[0];
      const body = table.items.map((item) => [
        item.name,
        item.inStorePrice,
        item.foodCost,
        item.packaging,
        item.commissionPct,
        item.platformFee,
        item.targetMarginPct,
      ]);
      setValue({ ...value, batchText: toCsv([header, ...body]).replace(/^\uFEFF/, "") });
      return;
    }
    const decoded = decodeCsvBytes(new Uint8Array(await file.arrayBuffer()));
    setEncodingNote(decoded.encoding === "big5" ? "這個 CSV 是 Big5（Excel 常見），已轉成看得到的中文。" : "");
    setValue({ ...value, batchText: decoded.text });
  }

  function downloadResults() {
    const rows: (string | number)[][] = [
      ["品項", "店內售價", "食材成本", "包材成本", "建議外送價", "抽成金額", "實收", "扣成本後剩餘", "實收毛利率", "若用店內價的實收毛利率"],
    ];
    for (const item of parsed.items) {
      const itemQuote = quoteDelivery(item);
      if (!itemQuote.ok) {
        rows.push([item.name, item.inStorePrice, item.foodCost, item.packaging, itemQuote.reason, "", "", "", "", ""]);
        continue;
      }
      rows.push([
        item.name,
        item.inStorePrice,
        item.foodCost,
        item.packaging,
        itemQuote.suggestedPrice,
        Math.round(itemQuote.quote.commission),
        Math.round(itemQuote.quote.net),
        Math.round(itemQuote.quote.leftover),
        itemQuote.quote.marginOnNet == null ? "" : `${(itemQuote.quote.marginOnNet * 100).toFixed(1)}%`,
        itemQuote.inStore?.marginOnNet == null ? "" : `${(itemQuote.inStore.marginOnNet * 100).toFixed(1)}%`,
      ]);
    }
    downloadText("外送定價結果.csv", toCsv(rows));
  }

  return (
    <div className="space-y-4">
      <StorageNote fromStorage={fromStorage} onReset={reset} />
      <div className="grid gap-4 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:grid-cols-3">
        <NumberField label="平台抽成" suffix="%" min={0} max={100} value={single.commissionPct} onChange={(next) => setSingle("commissionPct", next)} hint="填 35 代表 35%，以合約為準。100 代表平台全拿走" />
        <NumberField label="每單平台費" suffix="元" min={0} max={1e12} value={single.platformFee} onChange={(next) => setSingle("platformFee", next)} hint="沒有就填 0" />
        <NumberField label="目標實收毛利率" suffix="%" min={0} max={99} value={single.targetMarginPct} onChange={(next) => setSingle("targetMarginPct", next)} hint="扣完抽成後，實收裡想留下的比例，要小於 100" />
      </div>

      <Tabs defaultValue="single">
        <TabsList className="h-11">
          <TabsTrigger value="single" className="h-10 px-3">這一道</TabsTrigger>
          <TabsTrigger value="batch" className="h-10 px-3">整份菜單</TabsTrigger>
        </TabsList>
        <TabsContent value="single" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>品項</Label>
                <Input value={single.name} onValueChange={(next) => setSingle("name", next)} />
              </div>
              <NumberField label="店內售價" suffix="元" min={0} max={1e12} value={single.inStorePrice} onChange={(next) => setSingle("inStorePrice", next)} />
              <NumberField label="食材成本" suffix="元" min={0} max={1e12} value={single.foodCost} onChange={(next) => setSingle("foodCost", next)} />
              <NumberField label="包材" suffix="元" min={0} max={1e12} value={single.packaging} onChange={(next) => setSingle("packaging", next)} hint="外帶盒、餐具、袋子" />
            </div>
            <QuotePanel quote={quote} input={single} />
          </div>
        </TabsContent>
        <TabsContent value="batch" className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="h-11" onClick={() => downloadText("外送定價範本.csv", toCsv(deliveryTemplateRows))}>
              下載 CSV 範本
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() =>
                downloadXlsx("外送定價範本.xlsx", [
                  { name: "菜單", rows: deliveryTemplateRows },
                  {
                    name: "說明",
                    rows: [
                      ["抽成比例、每單平台費、目標毛利率可以留白，留白就用頁面上的數字。"],
                      ["請填 35 代表 35%，不要填 0.35。"],
                      ["檔案請用 UTF-8。Excel 使用者直接用 xlsx 即可。"],
                    ],
                  },
                ])
              }
            >
              下載 Excel 範本
            </Button>
            <Button type="button" className="h-11" onClick={downloadResults} disabled={parsed.items.length === 0}>
              下載試算結果 CSV
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="menu-file">上傳 CSV 或 Excel</Label>
            <label htmlFor="menu-file" className="inline-flex h-11 cursor-pointer items-center rounded-lg border border-input bg-card px-4 text-sm">
              {fileName || "選擇檔案"}
            </label>
            <input
              id="menu-file"
              type="file"
              accept=".csv,.xlsx,.xls,text/csv"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void onFile(file);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="menu-paste">或直接貼上</Label>
            <Textarea id="menu-paste" className="min-h-40 font-mono text-xs" value={value.batchText} onChange={(event) => setValue({ ...value, batchText: event.target.value })} />
          </div>
          {encodingNote ? <Callout tone="good">{encodingNote}</Callout> : null}
          {parsed.decimalCommissionWarning ? (
            <Callout tone="warn">抽成欄裡的數字都小於或等於 1。若 0.35 代表 35%，請改成 35。</Callout>
          ) : null}
          {parsed.errors.map((error) => (
            <Callout key={error} tone="bad">{error}</Callout>
          ))}
          {parsed.items.length > 0 ? <BatchTable items={parsed.items} /> : null}
        </TabsContent>
      </Tabs>

      <Explain title="怎麼看結果">
        <p>
          目標毛利率的分母是實收，不是標價。實收＝售價 ×（1 − 抽成）− 每單費用。再扣食材和包材，剩下的除以實收，就是這頁說的毛利。
        </p>
        <p>建議售價會無條件進位到 10 元，避免四捨五入之後毛利不夠。房租和人事不在這頁，請回損益兩平看整間店。</p>
        <p>範例牛肉麵：店內 180、食材 58、包材 6、抽成 35%、目標實收毛利 55%。按恢復範例就是這道。</p>
      </Explain>
    </div>
  );
}

function QuotePanel({ quote, input }: { quote: ReturnType<typeof quoteDelivery>; input: DeliveryInput }) {
  if (!quote.ok) return <Callout tone="bad">{quote.reason}</Callout>;
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="建議外送價" value={ntd(quote.suggestedPrice)} hint={`算式是 ${num(quote.exactPrice, 0)} 元，進位到 10 元`} />
        <Stat label="比店內價" value={quote.markupVsInStore == null ? "—" : `+${pct(quote.markupVsInStore)}`} hint="建議價相對店內價" tone="paper" />
      </div>
      <div className="rounded-2xl bg-card p-4 text-sm leading-7 ring-1 ring-foreground/10">
        <p>食材加包材 {ntd(quote.directCost)}。要留下 {input.targetMarginPct}% 的實收毛利，實收至少要 {ntd(quote.netNeeded)}。</p>
        <p>
          （{ntd(quote.netNeeded)} ＋ 每單費用 {ntd(input.platformFee)}）÷（1 − {input.commissionPct}%）＝ {ntd(quote.exactPrice)}。
        </p>
        <p>
          上架 {ntd(quote.suggestedPrice)} 時，抽成 {ntd(quote.quote.commission)}，實收 {ntd(quote.quote.net)}，扣完食材包材剩 {ntd(quote.quote.leftover)}，實收毛利率 {pct(quote.quote.marginOnNet)}。
        </p>
        {quote.inStore ? (
          <p>
            若直接用店內價 {ntd(input.inStorePrice)} 上架，實收 {ntd(quote.inStore.net)}，剩下 {ntd(quote.inStore.leftover)}，實收毛利率只剩 {pct(quote.inStore.marginOnNet)}。
          </p>
        ) : null}
      </div>
    </div>
  );
}

function BatchTable({ items }: { items: DeliveryInput[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-card ring-1 ring-foreground/10">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="text-xs text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">品項</th>
            <th className="px-3 py-2 font-medium">店內價</th>
            <th className="px-3 py-2 font-medium">建議外送價</th>
            <th className="px-3 py-2 font-medium">實收毛利率</th>
            <th className="px-3 py-2 font-medium">用店內價上架</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const quote = quoteDelivery(item);
            return (
              <tr key={`${item.name}-${item.inStorePrice}`} className="border-t border-border">
                <td className="px-3 py-2">{item.name}</td>
                <td className="num px-3 py-2">{ntd(item.inStorePrice)}</td>
                <td className="num px-3 py-2">{quote.ok ? ntd(quote.suggestedPrice) : quote.reason}</td>
                <td className="num px-3 py-2">{quote.ok ? pct(quote.quote.marginOnNet) : "—"}</td>
                <td className="num px-3 py-2">{quote.ok ? pct(quote.inStore?.marginOnNet) : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
