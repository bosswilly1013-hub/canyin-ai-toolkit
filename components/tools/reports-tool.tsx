"use client";

import { useMemo, useState, type ReactElement } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { decodeCsvBytes, parseCsv, parseLooseNumber, toCsv } from "@/lib/csv";
import { downloadText, downloadXlsx } from "@/lib/download";
import { ntd, num, pct, signedNtd } from "@/lib/format";
import {
  columnRoles,
  guessMapping,
  parseDateCell,
  summarizeDaily,
  summarizePnl,
  type ColumnRole,
  type DailyRow,
} from "@/lib/calc/reports";
import { buildSampleSales, dailyTemplateHeaders, examplePnlRows } from "@/lib/calc/sample";
import { Callout, Explain, Stat } from "@/components/tool-bits";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const colors = ["#e15a2b", "#1d3c34", "#c48a12", "#3d6f8c", "#8a5a44", "#5e584e"];

type Sheet = { headers: string[]; rows: string[][] };

export function ReportsTool() {
  const sample = useMemo(() => buildSampleSales(), []);
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [mapping, setMapping] = useState<Partial<Record<ColumnRole, number>>>({});
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [encodingNote, setEncodingNote] = useState("");
  const [source, setSource] = useState<"範例日報" | "你的檔案" | "範例損益表">("範例日報");
  const [pnlMode, setPnlMode] = useState(false);

  const dailyRows = useMemo(() => {
    if (source === "範例日報") return sample;
    if (!sheet || pnlMode) return [];
    return sheet.rows.flatMap((row) => {
      const dateIndex = mapping.date;
      const revenueIndex = mapping.revenue;
      if (dateIndex == null || revenueIndex == null) return [];
      const date = parseDateCell(row[dateIndex] ?? "");
      const revenue = parseLooseNumber(row[revenueIndex] ?? "");
      if (!date || revenue == null) return [];
      const read = (role: ColumnRole) => {
        const index = mapping[role];
        if (index == null) return undefined;
        const value = parseLooseNumber(row[index] ?? "");
        return value == null ? undefined : value;
      };
      const item: DailyRow = {
        date,
        revenue,
        customers: read("customers"),
        foodCost: read("foodCost"),
        labor: read("labor"),
        rent: read("rent"),
        utilities: read("utilities"),
        otherCost: read("otherCost"),
        deliveryRevenue: read("deliveryRevenue"),
        dineInRevenue: read("dineInRevenue"),
      };
      return [item];
    });
  }, [mapping, pnlMode, sample, sheet, source]);

  const summary = summarizeDaily(dailyRows);
  const pnl = summarizePnl(
    source === "範例損益表"
      ? examplePnlRows
      : sheet && pnlMode && mapping.label != null && mapping.amount != null
        ? sheet.rows.flatMap((row) => {
            const label = row[mapping.label!] ?? "";
            const amount = parseLooseNumber(row[mapping.amount!] ?? "");
            return amount == null ? [] : [{ label, amount }];
          })
        : [],
  );

  async function onFile(file: File) {
    setError("");
    setEncodingNote("");
    setFileName(file.name);
    try {
      const lower = file.name.toLowerCase();
      let rows: string[][];
      if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
        const XLSX = await import("xlsx");
        const book = XLSX.read(await file.arrayBuffer(), { type: "array" });
        const first = book.Sheets[book.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(first, { header: 1, raw: true, defval: "" }) as unknown[][];
        rows = raw.map((row) => row.map((cell) => (cell == null ? "" : String(cell))));
      } else {
        const decoded = decodeCsvBytes(new Uint8Array(await file.arrayBuffer()));
        setEncodingNote(decoded.encoding === "big5" ? "這個 CSV 是 Big5，已轉成看得到的中文。" : "");
        rows = parseCsv(decoded.text);
      }
      if (rows.length < 2) {
        setError("至少要有標題列和一列資料。");
        return;
      }
      const headers = rows[0].map((cell, index) => cell || `欄 ${index + 1}`);
      const body = rows.slice(1);
      const guessed = guessMapping(headers);
      setSheet({ headers, rows: body });
      setMapping(guessed);
      setSource("你的檔案");
      setPnlMode(guessed.date == null && guessed.label != null && guessed.amount != null);
      if (guessed.revenue == null && guessed.amount == null) {
        setError("沒有自動對到營業額或金額。請用下面的欄位對應改一下。");
      }
    } catch {
      setError("這個檔案讀不起來。請改存成 xlsx，或 CSV（UTF-8、Big5 都可以）。");
    }
  }

  function loadDailySample() {
    setSource("範例日報");
    setPnlMode(false);
    setError("");
    setSheet(null);
  }

  function loadPnlSample() {
    setSource("範例損益表");
    setPnlMode(true);
    setError("");
    setSheet(null);
  }

  const showDaily = !pnlMode && summary.days > 0;
  const showPnl = pnlMode && (pnl.revenue > 0 || pnl.cost > 0);

  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-muted-foreground">檔案只在這台瀏覽器裡讀，不會上傳。這站沒有後端可以收走你的報表。</p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant={source === "範例日報" ? "default" : "outline"} className="h-11" onClick={loadDailySample}>
          看範例日報
        </Button>
        <Button type="button" variant={source === "範例損益表" ? "default" : "outline"} className="h-11" onClick={loadPnlSample}>
          看範例損益表
        </Button>
        <Button type="button" variant="outline" className="h-11" onClick={() => downloadText("每日營業範本.csv", toCsv([dailyTemplateHeaders, ["2026-11-01", 18000, 80, 5800, 5200, 1600, 600, 700, 4000, 14000]]))}>
          下載日報範本
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11"
          onClick={() =>
            downloadXlsx("損益表範本.xlsx", [
              { name: "損益", rows: [["科目", "金額"], ...examplePnlRows.map((row) => [row.label, row.amount])] },
            ])
          }
        >
          下載損益表範本
        </Button>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="report-file">上傳你的 CSV 或 Excel</Label>
        <label htmlFor="report-file" className="inline-flex h-11 cursor-pointer items-center rounded-lg border border-input bg-card px-4 text-sm">
          {fileName || "選擇檔案"}
        </label>
        <input
          id="report-file"
          type="file"
          accept=".csv,.xlsx,.xls,text/csv"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void onFile(file);
          }}
        />
      </div>
      {encodingNote ? <Callout tone="good">{encodingNote}</Callout> : null}
      {error ? <Callout tone="warn">{error}</Callout> : null}

      {sheet && source === "你的檔案" ? (
        <div className="grid gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-2">
            <Button type="button" variant={!pnlMode ? "default" : "outline"} className="h-11" onClick={() => setPnlMode(false)}>
              當成每日營業
            </Button>
            <Button type="button" variant={pnlMode ? "default" : "outline"} className="h-11" onClick={() => setPnlMode(true)}>
              當成損益表
            </Button>
          </div>
          {(pnlMode ? columnRoles.filter((role) => role.role === "label" || role.role === "amount") : columnRoles.filter((role) => role.role !== "label" && role.role !== "amount")).map((role) => (
            <label key={role.role} className="space-y-1 text-sm">
              <span className="text-muted-foreground">{role.label}</span>
              <select
                className="h-11 w-full rounded-lg border border-input bg-transparent px-2"
                value={mapping[role.role] ?? ""}
                onChange={(event) => {
                  const next = event.target.value === "" ? undefined : Number(event.target.value);
                  setMapping((current) => ({ ...current, [role.role]: next }));
                }}
              >
                <option value="">不使用</option>
                {sheet.headers.map((header, index) => (
                  <option key={`${header}-${index}`} value={index}>
                    {header}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      ) : null}

      {showDaily ? <DailyView summary={summary} rows={dailyRows} source={source} /> : null}
      {showPnl ? <PnlView pnl={pnl} source={source} /> : null}
      {!showDaily && !showPnl ? <Callout>還沒有可以畫的數字。先看範例，或上傳有標題列的檔案。</Callout> : null}

      <Explain title="怎麼看結果">
        <p>日報的折線是每天營業額。柱狀圖是各月份合計，旁邊的百分比是跟上一個月比。星期圖用來確認週末是不是真的比較忙。</p>
        <p>有食材成本時會算出食材比。很多小店希望落在 28% 到 35%，這是經驗區間，不是法規。人事如果是整月一筆、卻被平均攤到每一天，成本圓餅仍然可以看結構，但不要把它當成單日決策。</p>
        <p>損益表把科目名稱含「營業額、營收、收入」的那列當成收入，其餘當成成本。收入減成本是扣掉這些科目之後剩下的，還沒有另外算稅。</p>
      </Explain>
      <Explain title="算給你看">
        <p>
          範例日報是 2026 年 9 月和 10 月、共 {sample.length} 天，週末的底比平日高，10 月再整體高約 6%，所以你會看到十月比九月高。
          範例損益表營業額 980,000，成本合計 857,600，剩下 122,400。檔案內容是算好的，不是 AI 編的。
        </p>
      </Explain>
    </div>
  );
}

function DailyView({
  summary,
  rows,
  source,
}: {
  summary: ReturnType<typeof summarizeDaily>;
  rows: DailyRow[];
  source: string;
}) {
  const line = rows.map((row) => ({ date: row.date.slice(5), revenue: row.revenue }));
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">現在看的是{source}，{summary.days} 天。</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="總營業額" value={ntd(summary.revenue)} />
        <Stat label="平均一天" value={ntd(summary.avgRevenue)} hint={summary.avgCustomers == null ? undefined : `約 ${num(summary.avgCustomers, 0)} 人`} />
        <Stat label="最高的一天" value={ntd(summary.best?.revenue)} hint={summary.best?.date} tone="paper" />
        <Stat label="食材比" value={pct(summary.foodPct)} hint={summary.foodPct == null ? "檔案裡沒有食材成本" : "食材 ÷ 營業額"} />
      </div>
      <ChartCard title="每天營業額">
        <LineChart data={line}>
          <CartesianGrid stroke="#e4d9c8" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={24} />
          <YAxis tick={{ fontSize: 11 }} width={48} />
          <Tooltip formatter={(value) => ntd(typeof value === "number" ? value : null)} />
          <Line type="monotone" dataKey="revenue" name="營業額" stroke="#e15a2b" dot={false} strokeWidth={2} />
        </LineChart>
      </ChartCard>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="各月合計">
          <BarChart data={summary.months}>
            <CartesianGrid stroke="#e4d9c8" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} width={48} />
            <Tooltip formatter={(value) => ntd(typeof value === "number" ? value : null)} />
            <Bar dataKey="revenue" name="營業額" fill="#1d3c34" radius={6} />
          </BarChart>
        </ChartCard>
        <ChartCard title="星期幾比較忙">
          <BarChart data={summary.weekday.map((day) => ({ ...day, avg: day.days ? Math.round(day.revenue / day.days) : 0 }))}>
            <CartesianGrid stroke="#e4d9c8" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} width={48} />
            <Tooltip formatter={(value) => ntd(typeof value === "number" ? value : null)} />
            <Bar dataKey="avg" name="平均營業額" fill="#e15a2b" radius={6} />
          </BarChart>
        </ChartCard>
      </div>
      {summary.mom.length > 0 ? (
        <ul className="space-y-1 text-sm">
          {summary.mom.map((month) => (
            <li key={month.month}>
              {month.month} 比前一個月 {signedNtd(month.delta)}（{month.deltaPct == null ? "—" : pct(month.deltaPct)}）。
            </li>
          ))}
        </ul>
      ) : null}
      {summary.costs.length > 0 ? (
        <ChartCard title="成本結構（檔案裡有的科目加總）">
          <PieChart>
            <Pie data={summary.costs} dataKey="amount" nameKey="label" outerRadius={90}>
              {summary.costs.map((slice, index) => (
                <Cell key={slice.key} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip formatter={(value) => ntd(typeof value === "number" ? value : null)} />
          </PieChart>
        </ChartCard>
      ) : null}
    </div>
  );
}

function PnlView({ pnl, source }: { pnl: ReturnType<typeof summarizePnl>; source: string }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">現在看的是{source}。</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="營業額" value={ntd(pnl.revenue)} />
        <Stat label="成本合計" value={ntd(pnl.cost)} />
        <Stat label="剩下" value={signedNtd(pnl.leftover)} hint={pnl.revenue > 0 ? `約營業額的 ${pct(pnl.leftover / pnl.revenue)}` : undefined} />
      </div>
      {pnl.costs.length > 0 ? (
        <ChartCard title="成本科目">
          <BarChart data={pnl.costs} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid stroke="#e4d9c8" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="label" width={72} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => ntd(typeof value === "number" ? value : null)} />
            <Bar dataKey="amount" name="金額" fill="#1d3c34" radius={6} />
          </BarChart>
        </ChartCard>
      ) : null}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactElement }) {
  return (
    <div className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      </div>
    </div>
  );
}
