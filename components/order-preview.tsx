"use client";

import { useMemo, useState } from "react";
import { decodeCsvBytes } from "@/lib/csv";
import { downloadXlsx } from "@/lib/download";
import { ntd } from "@/lib/format";
import {
  type ColumnMapping,
  type OrderField,
  detectColumns,
  findHeader,
  rowsFromMatrix,
  sampleOrderRows,
  summarizeOrders,
} from "@/lib/order-sheet";
import { Button } from "@/components/ui/button";

const fieldLabels: { field: OrderField; label: string }[] = [
  { field: "vendor", label: "廠商" },
  { field: "item", label: "品項" },
  { field: "unit", label: "單位" },
  { field: "price", label: "單價" },
  { field: "qty", label: "數量" },
  { field: "date", label: "日期" },
];

export function OrderPreview() {
  const [fileName, setFileName] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [matrix, setMatrix] = useState<unknown[][] | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [headerIndex, setHeaderIndex] = useState(-1);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);

  const preview = useMemo(() => {
    if (!matrix || !mapping) return null;
    const parsed = rowsFromMatrix(matrix, mapping, headerIndex);
    const summary = summarizeOrders(parsed.rows);
    return { ...summary, skipped: parsed.skipped };
  }, [matrix, mapping, headerIndex]);

  async function onFile(file: File) {
    setError("");
    setNote("");
    setFileName(file.name);
    try {
      const lower = file.name.toLowerCase();
      let rows: unknown[][];
      if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
        const XLSX = await import("xlsx");
        const book = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
        const sheet = book.Sheets[book.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: "", blankrows: false }) as unknown[][];
      } else {
        const decoded = decodeCsvBytes(new Uint8Array(await file.arrayBuffer()));
        const XLSX = await import("xlsx");
        const book = XLSX.read(decoded.text, { type: "string" });
        const sheet = book.Sheets[book.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" }) as unknown[][];
        if (decoded.encoding === "big5") setNote("這個 CSV 是 Big5，已轉成看得到的中文。");
      }
      const found = findHeader(rows);
      setMatrix(rows);
      setHeaders(found.headers.length ? found.headers : ["第 1 欄"]);
      setHeaderIndex(found.headerIndex);
      setMapping(found.mapping.vendor >= 0 ? found.mapping : detectColumns(found.headers));
    } catch {
      setError("這個檔案讀不起來。請改存成 xlsx，或 CSV（UTF-8、Big5 都可以）。");
      setMatrix(null);
    }
  }

  const items = preview?.vendors.flatMap((vendor) => vendor.items.map((item) => ({ vendor: vendor.name, ...item }))) ?? [];

  return (
    <div className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
      <h2 className="text-lg font-semibold">先在瀏覽器裡看會變成什麼</h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">檔案只在這台電腦整理，不會上傳。部署之後，到叫貨系統的「資料管理」再傳一次，才會真的變成你的系統。</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="inline-flex h-11 cursor-pointer items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
          選擇 Excel 或 CSV
          <input
            className="sr-only"
            type="file"
            accept=".csv,.txt,.xlsx,.xls,text/csv"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void onFile(file);
            }}
          />
        </label>
        <Button type="button" variant="outline" className="h-11" onClick={() => downloadXlsx("叫貨資料範例.xlsx", [{ name: "叫貨", rows: sampleOrderRows }])}>
          下載範例
        </Button>
        {fileName ? <span className="text-sm text-muted-foreground">{fileName}</span> : null}
      </div>
      {note ? <p className="mt-3 text-sm text-muted-foreground">{note}</p> : null}
      {error ? <p className="mt-3 text-sm text-[#8d1d15]">{error}</p> : null}
      {mapping ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {fieldLabels.map(({ field, label }) => (
            <label key={field} className="text-sm">
              <span className="mb-1 block text-muted-foreground">{label}</span>
              <select
                className="h-11 w-full rounded-lg border border-input bg-transparent px-2"
                value={mapping[field]}
                onChange={(event) => setMapping({ ...mapping, [field]: Number(event.target.value) })}
              >
                <option value={-1}>沒有這一欄</option>
                {headers.map((header, index) => (
                  <option key={`${header}-${index}`} value={index}>
                    {header || `第 ${index + 1} 欄`}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      ) : null}
      {preview ? (
        <div className="mt-4">
          <p className="text-sm">
            {preview.vendors.length} 家廠商、{items.length} 個品項、{preview.orderCount} 張歷史叫貨單
            {preview.skipped.length ? `，略過 ${preview.skipped.length} 列` : ""}。
          </p>
          {preview.months.length ? (
            <ul className="mt-2 space-y-1 text-sm">
              {preview.months.map((month) => (
                <li key={month.ym}>
                  {month.ym} 進貨金額 {ntd(month.cost)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">沒有日期和數量，所以只會列出廠商和品項，不會有平常叫貨量。</p>
          )}
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3 font-medium">廠商</th>
                  <th className="py-2 pr-3 font-medium">品項</th>
                  <th className="py-2 pr-3 font-medium">單位</th>
                  <th className="py-2 pr-3 font-medium">參考價</th>
                  <th className="py-2 font-medium">平常叫</th>
                </tr>
              </thead>
              <tbody>
                {items.slice(0, 12).map((item) => (
                  <tr key={`${item.vendor}-${item.name}`} className="border-t border-border">
                    <td className="py-2 pr-3">{item.vendor}</td>
                    <td className="py-2 pr-3">{item.name}</td>
                    <td className="py-2 pr-3">{item.unit}</td>
                    <td className="num py-2 pr-3">{ntd(item.price)}</td>
                    <td className="num py-2">{item.suggested || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {items.length > 12 ? <p className="mt-2 text-xs text-muted-foreground">還有 {items.length - 12} 個品項，部署後匯入會全部建立。</p> : null}
        </div>
      ) : null}
    </div>
  );
}
