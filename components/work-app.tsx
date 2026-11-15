"use client";

import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { decodeCsvBytes, parseCsv } from "@/lib/csv";
import { downloadText, downloadXlsx } from "@/lib/download";
import { ntd, pct } from "@/lib/format";
import { usePersisted } from "@/lib/storage";
import {
  type AppId,
  type Expense,
  type HistLine,
  type Member,
  type OrderBook,
  type RecipeRow,
  type Review,
  type Sale,
  type Schedule,
  type SopItem,
  type StockItem,
  type SurveyState,
  dishesOf,
  draftFromHistory,
  expenseCategories,
  getApp,
  lineMessage,
  monthReport,
  parseExpenses,
  parseMembers,
  parseMenu,
  parseOrderSheet,
  parseReviews,
  parseSales,
  parseSchedule,
  parseSop,
  parseStock,
  parseSurvey,
  replyFor,
  reviewTags,
  samples,
  weekdayName,
} from "@/lib/apps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function todayTaipei() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

async function matrixFromFile(file: File) {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    const XLSX = await import("xlsx");
    const book = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
    const sheet = book.Sheets[book.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: "", blankrows: false }) as unknown[][];
  }
  const decoded = decodeCsvBytes(new Uint8Array(await file.arrayBuffer()));
  return parseCsv(decoded.text);
}

const parsers: Record<AppId, (matrix: unknown[][]) => { ok: true; value: unknown } | { ok: false; error: string }> = {
  orders: parseOrderSheet,
  stock: parseStock,
  schedule: parseSchedule,
  sales: parseSales,
  menu: parseMenu,
  members: parseMembers,
  reviews: parseReviews,
  expenses: parseExpenses,
  sop: parseSop,
  survey: parseSurvey,
};

export function WorkApp({ id }: { id: AppId }) {
  const info = getApp(id);
  const store = usePersisted<{ data: unknown }>(`lazykit.v1.app.${id}`, { data: null });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  if (!info) return null;
  const data = store.value.data;

  async function loadMatrix(matrix: unknown[][]) {
    const parsed = parsers[id](matrix);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    setError("");
    setNotice("已讀進你的資料。");
    store.setValue({ data: parsed.value });
  }

  return (
    <article className="mx-auto max-w-5xl px-4 py-6 md:py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{info.name}</h1>
      <p className="mt-2 text-base leading-7">{info.help}</p>
      <ol className="mt-4 grid gap-2 text-sm leading-6 md:grid-cols-3">
        <li className="rounded-2xl bg-card p-3 ring-1 ring-foreground/10">① 下載範例，或上傳你的 Excel／CSV</li>
        <li className="rounded-2xl bg-card p-3 ring-1 ring-foreground/10">② 系統用你的資料排好</li>
        <li className="rounded-2xl bg-card p-3 ring-1 ring-foreground/10">③ 直接改、查、匯出或列印</li>
      </ol>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" className="h-11" onClick={() => void loadMatrix(samples[id])}>
          先用範例資料試玩
        </Button>
        <Button type="button" variant="outline" className="h-11" onClick={() => void downloadXlsx(`${info.name}範例.xlsx`, [{ name: "資料", rows: samples[id] }])}>
          下載範例
        </Button>
        <label className="inline-flex h-11 cursor-pointer items-center rounded-lg border border-border bg-background px-4 text-sm font-medium">
          上傳你的資料
          <input
            className="sr-only"
            type="file"
            accept=".csv,.txt,.xlsx,.xls,text/csv"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              void matrixFromFile(file).then(loadMatrix).catch(() => setError("這個檔案讀不起來。請改存成 xlsx 或 csv。"));
            }}
          />
        </label>
        <Button type="button" variant="outline" className="h-11" onClick={() => downloadText(`${info.name}備份.json`, JSON.stringify(store.value), "application/json")}>
          匯出備份
        </Button>
        <label className="inline-flex h-11 cursor-pointer items-center rounded-lg border border-border px-4 text-sm font-medium">
          匯入備份
          <input
            className="sr-only"
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              void file.text().then((text) => {
                const parsed = JSON.parse(text) as { data?: unknown };
                if (!parsed || !("data" in parsed)) {
                  setError("這不是這套系統的備份。");
                  return;
                }
                store.setValue({ data: parsed.data ?? null });
                setError("");
                setNotice("已把備份讀回來。");
              }).catch(() => setError("備份檔讀不起來。"));
            }}
          />
        </label>
        <Button type="button" variant="outline" className="h-11" onClick={() => { store.reset(); setNotice("已清除這台裝置上的資料。"); }}>
          清空示範資料
        </Button>
        <Button type="button" variant="outline" className="h-11" onClick={() => window.print()}>
          列印
        </Button>
      </div>
      {error ? <p className="mt-3 rounded-2xl bg-[#fff1ef] px-4 py-3 text-sm leading-6 text-[#8d1d15]">{error}</p> : null}
      {notice ? <p className="mt-3 text-sm text-muted-foreground">{notice}</p> : null}
      <div className="mt-6">
        {data == null ? <p className="rounded-2xl bg-card p-4 text-sm leading-6 ring-1 ring-foreground/10">還沒有資料。上傳你的{info.upload}，或先用範例試玩。</p> : <Workspace id={id} data={data} setData={(next) => store.setValue({ data: next })} />}
      </div>
      <p className="mt-8 text-xs leading-5 text-muted-foreground">資料存在這台手機或電腦，不會上傳。換裝置請用匯出備份。</p>
    </article>
  );
}

function Workspace({ id, data, setData }: { id: AppId; data: unknown; setData: (next: unknown) => void }) {
  if (id === "orders") return <OrdersView book={data as OrderBook} setBook={setData} />;
  if (id === "stock") return <StockView items={data as StockItem[]} setItems={setData} />;
  if (id === "schedule") return <ScheduleView value={data as Schedule} setValue={setData} />;
  if (id === "sales") return <SalesView rows={data as Sale[]} />;
  if (id === "menu") return <MenuView rows={data as RecipeRow[]} />;
  if (id === "members") return <MembersView members={data as Member[]} setMembers={setData} />;
  if (id === "reviews") return <ReviewsView reviews={data as Review[]} />;
  if (id === "expenses") return <ExpensesView rows={data as Expense[]} setRows={setData} />;
  if (id === "sop") return <SopView items={data as SopItem[]} setItems={setData} />;
  return <SurveyView state={data as SurveyState} setState={setData} />;
}

function OrdersView({ book, setBook }: { book: OrderBook; setBook: (next: OrderBook) => void }) {
  const [tab, setTab] = useState<"today" | "check" | "log" | "month">("today");
  const [copied, setCopied] = useState("");
  const date = todayTaipei();
  const vendors = [...new Set(book.draft.map((line) => line.vendor))];
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {([["today", "今天叫貨"], ["check", "驗收"], ["log", "叫貨紀錄"], ["month", "月報"]] as const).map(([key, label]) => (
          <Button key={key} type="button" variant={tab === key ? "default" : "outline"} className="h-11" onClick={() => setTab(key)}>
            {label}
          </Button>
        ))}
        <Button type="button" variant="outline" className="h-11" onClick={() => void downloadXlsx("叫貨.xlsx", [{ name: "紀錄", rows: [["日期", "廠商", "品項", "單位", "單價", "數量", "實收"], ...book.history.map((line) => [line.date, line.vendor, line.item, line.unit, line.price, line.qty, line.received ?? ""])] }])}>
          匯出 Excel
        </Button>
      </div>
      {tab === "today" ? (
        <div className="mt-4 space-y-4">
          {vendors.map((vendor) => (
            <section key={vendor} className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{vendor}</h2>
                <Button
                  type="button"
                  className="h-11"
                  onClick={() => void navigator.clipboard.writeText(lineMessage(vendor, book.draft, date)).then(() => setCopied(vendor))}
                >
                  {copied === vendor ? "已複製" : "複製 LINE 文字"}
                </Button>
              </div>
              <ul className="mt-3 space-y-2">
                {book.draft.filter((line) => line.vendor === vendor).map((line) => (
                  <li key={`${line.vendor}-${line.item}`} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="min-w-28 font-medium">{line.item}</span>
                    <span className="text-muted-foreground">平常叫 {line.suggested}{line.unit}</span>
                    <Input
                      className="h-11 w-24"
                      inputMode="decimal"
                      aria-label={`${line.item}數量`}
                      value={String(line.qty)}
                      onChange={(event) => {
                        const qty = Number(event.target.value);
                        setBook({
                          ...book,
                          draft: book.draft.map((item) => item.vendor === line.vendor && item.item === line.item ? { ...item, qty: Number.isFinite(qty) ? qty : 0 } : item),
                        });
                      }}
                    />
                    <span>{line.unit}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <Button
            type="button"
            className="h-11"
            onClick={() => {
              const next: HistLine[] = book.draft.filter((line) => line.qty > 0).map((line) => ({
                date, vendor: line.vendor, item: line.item, unit: line.unit, price: line.price, qty: line.qty, received: null,
              }));
              const history = [...book.history, ...next];
              setBook({ history, draft: draftFromHistory(history) });
            }}
          >
            存成今天的叫貨單
          </Button>
        </div>
      ) : null}
      {tab === "check" ? (
        <ul className="mt-4 space-y-2">
          {open.length === 0 ? <li className="text-sm text-muted-foreground">沒有還沒驗收的叫貨。</li> : null}
          {book.history.map((line, index) => line.received == null && line.qty > 0 ? (
            <li key={`${line.date}-${line.vendor}-${line.item}-${index}`} className="flex flex-wrap items-center gap-2 rounded-2xl bg-card p-3 text-sm ring-1 ring-foreground/10">
              <span>{line.date} {line.vendor} {line.item} 叫了 {line.qty}{line.unit}</span>
              <Input
                className="h-11 w-24"
                inputMode="decimal"
                placeholder="實收"
                aria-label={`${line.item}實收`}
                onChange={(event) => {
                  const received = Number(event.target.value);
                  const history = book.history.map((item, itemIndex) => itemIndex === index ? { ...item, received: Number.isFinite(received) ? received : null } : item);
                  setBook({ ...book, history });
                }}
              />
            </li>
          ) : null)}
        </ul>
      ) : null}
      {tab === "log" ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="text-muted-foreground"><th className="py-2">日期</th><th>廠商</th><th>品項</th><th>數量</th><th>實收</th><th>差</th></tr></thead>
            <tbody>
              {book.history.map((line, index) => (
                <tr key={`${line.date}-${index}`} className="border-t border-border">
                  <td className="py-2">{line.date}</td><td>{line.vendor}</td><td>{line.item}</td><td>{line.qty}{line.unit}</td>
                  <td>{line.received ?? "—"}</td><td>{line.received == null ? "—" : line.received - line.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {tab === "month" ? (
        <ul className="mt-4 space-y-2 text-sm">
          {monthReport(book.history).map((row) => (
            <li key={`${row.month}-${row.vendor}-${row.item}`} className="flex justify-between gap-3 border-b border-border py-2">
              <span>{row.month} {row.vendor} {row.item}</span>
              <span>{row.qty} · {ntd(row.amount)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function StockView({ items, setItems }: { items: StockItem[]; setItems: (next: StockItem[]) => void }) {
  return (
    <div>
      <Button type="button" variant="outline" className="h-11" onClick={() => void downloadXlsx("盤點.xlsx", [{ name: "盤點", rows: [["品項", "單位", "帳面", "實盤", "差"], ...items.map((item) => [item.name, item.unit, item.book, item.actual ?? "", item.actual == null ? "" : item.actual - item.book])] }])}>匯出 Excel</Button>
      <ul className="mt-4 space-y-2">
        {items.map((item, index) => (
          <li key={item.name} className="flex flex-wrap items-center gap-2 rounded-2xl bg-card p-3 text-sm ring-1 ring-foreground/10">
            <span className="min-w-24 font-medium">{item.name}</span>
            <span className="text-muted-foreground">帳面 {item.book}{item.unit}</span>
            <Input className="h-11 w-24" inputMode="decimal" aria-label={`${item.name}實盤`} value={item.actual ?? ""} onChange={(event) => {
              const actual = event.target.value === "" ? null : Number(event.target.value);
              setItems(items.map((row, rowIndex) => rowIndex === index ? { ...row, actual: actual == null || Number.isFinite(actual) ? actual : row.actual } : row));
            }} />
            <span>{item.actual == null ? "還沒盤" : `差 ${item.actual - item.book}`}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const week = ["一", "二", "三", "四", "五", "六", "日"];
function ScheduleView({ value, setValue }: { value: Schedule; setValue: (next: Schedule) => void }) {
  const cost = value.staff.reduce((sum, person, index) => sum + person.wage * value.hours[index].reduce((a, b) => a + b, 0), 0);
  return (
    <div>
      <p className="text-sm">這一週薪資約 {ntd(cost)}</p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead><tr><th className="py-2">員工</th>{week.map((day) => <th key={day}>{day}</th>)}</tr></thead>
          <tbody>
            {value.staff.map((person, index) => (
              <tr key={person.name} className="border-t border-border">
                <td className="py-2">{person.name}<div className="text-xs text-muted-foreground">{person.role} {person.wage}/時</div></td>
                {value.hours[index].map((hours, day) => (
                  <td key={day}>
                    <button type="button" className="h-11 w-12 rounded-lg bg-muted" onClick={() => {
                      const next = hours === 0 ? 4 : hours === 4 ? 8 : 0;
                      const hoursGrid = value.hours.map((row, rowIndex) => rowIndex === index ? row.map((cell, cellIndex) => cellIndex === day ? next : cell) : row);
                      setValue({ ...value, hours: hoursGrid });
                    }}>{hours || "休"}</button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">點格子切換：休、4 小時、8 小時。</p>
    </div>
  );
}

function SalesView({ rows }: { rows: Sale[] }) {
  const byDay = new Map<string, number>();
  const byWeek = new Map<string, number>();
  const byItem = new Map<string, number>();
  const byChannel = new Map<string, number>();
  for (const row of rows) {
    byDay.set(row.date, (byDay.get(row.date) || 0) + row.amount);
    const label = `週${weekdayName(row.date)}`;
    byWeek.set(label, (byWeek.get(label) || 0) + row.amount);
    byItem.set(row.item, (byItem.get(row.item) || 0) + row.amount);
    byChannel.set(row.channel, (byChannel.get(row.channel) || 0) + row.amount);
  }
  const days = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, amount]) => ({ date: date.slice(5), amount }));
  return (
    <div className="space-y-4">
      <p className="text-sm">合計 {ntd([...byDay.values()].reduce((a, b) => a + b, 0))}</p>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={days}><XAxis dataKey="date" /><YAxis /><Tooltip /><Bar dataKey="amount" fill="#1d3c34" /></BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="text-sm leading-7">
        <li>週間：{[...byWeek.entries()].map(([name, amount]) => `${name} ${ntd(amount)}`).join("、")}</li>
        <li>品項：{[...byItem.entries()].map(([name, amount]) => `${name} ${ntd(amount)}`).join("、")}</li>
        <li>通路：{[...byChannel.entries()].map(([name, amount]) => `${name} ${ntd(amount)}`).join("、")}</li>
      </ul>
    </div>
  );
}

function MenuView({ rows }: { rows: RecipeRow[] }) {
  const dishes = dishesOf(rows);
  return (
    <ul className="space-y-3">
      {dishes.map((dish) => (
        <li key={dish.dish} className="rounded-2xl bg-card p-4 text-sm leading-6 ring-1 ring-foreground/10">
          <p className="text-lg font-semibold">{dish.dish}</p>
          <p>成本 {ntd(dish.cost)}，現在賣 {ntd(dish.price)}，毛利 {pct(dish.margin)}</p>
          <p>若食材要留在 35% 以內，建議賣 {ntd(dish.suggest)}</p>
        </li>
      ))}
    </ul>
  );
}

function MembersView({ members, setMembers }: { members: Member[]; setMembers: (next: Member[]) => void }) {
  const [query, setQuery] = useState("");
  const shown = members.filter((member) => member.phone.includes(query) || member.name.includes(query));
  function update(phone: string, delta: number) {
    setMembers(members.map((member) => member.phone === phone ? { ...member, points: Math.max(0, member.points + delta) } : member));
  }
  return (
    <div>
      <Input className="h-11" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="輸入手機或姓名" aria-label="找會員" />
      <ul className="mt-3 space-y-2">
        {shown.length === 0 ? <li className="text-sm text-muted-foreground">沒有這支電話。</li> : null}
        {shown.map((member) => (
          <li key={member.phone} className="flex flex-wrap items-center gap-2 rounded-2xl bg-card p-3 ring-1 ring-foreground/10">
            <span className="font-medium">{member.name}</span>
            <span className="text-sm">{member.phone}</span>
            <span className="text-sm">{member.points} 點</span>
            <Button type="button" className="h-11" onClick={() => update(member.phone, 1)}>加 1 點</Button>
            <Button type="button" variant="outline" className="h-11" onClick={() => update(member.phone, -10)}>扣 10 點兌換</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReviewsView({ reviews }: { reviews: Review[] }) {
  const avg = reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length;
  return (
    <div className="space-y-3">
      <p className="text-sm">平均 {avg.toFixed(1)} 顆，共 {reviews.length} 則</p>
      {reviews.map((review, index) => (
        <article key={`${review.date}-${index}`} className="rounded-2xl bg-card p-4 text-sm leading-6 ring-1 ring-foreground/10">
          <p>{review.stars} 顆 · {review.date} · {reviewTags(review.text).join("、") || "沒有對到關鍵字"}</p>
          <p className="mt-1">{review.text}</p>
          <Button type="button" variant="outline" className="mt-2 h-11" onClick={() => void navigator.clipboard.writeText(replyFor(review.stars))}>複製回覆</Button>
        </article>
      ))}
    </div>
  );
}

function ExpensesView({ rows, setRows }: { rows: Expense[]; setRows: (next: Expense[]) => void }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(expenseCategories[0]);
  const months = new Map<string, number>();
  for (const row of rows) months.set(row.date.slice(0, 7), (months.get(row.date.slice(0, 7)) || 0) + row.amount);
  return (
    <div>
      <form className="flex flex-wrap gap-2" onSubmit={(event) => {
        event.preventDefault();
        const value = Number(amount);
        if (!title || !Number.isFinite(value)) return;
        setRows([...rows, { date: todayTaipei(), title, category, amount: value }]);
        setTitle("");
        setAmount("");
      }}>
        <Input className="h-11 max-w-40" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="項目" aria-label="項目" />
        <Input className="h-11 w-28" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="金額" inputMode="decimal" aria-label="金額" />
        <select className="h-11 rounded-lg border border-input px-2" value={category} onChange={(event) => setCategory(event.target.value)} aria-label="分類">
          {expenseCategories.map((item) => <option key={item}>{item}</option>)}
        </select>
        <Button type="submit" className="h-11">記一筆</Button>
      </form>
      <ul className="mt-4 text-sm">
        {[...months.entries()].map(([month, total]) => <li key={month}>{month} 共 {ntd(total)}</li>)}
      </ul>
    </div>
  );
}

function SopView({ items, setItems }: { items: SopItem[]; setItems: (next: SopItem[]) => void }) {
  const done = items.filter((item) => item.done).length;
  return (
    <div>
      <p className="text-sm">完成 {done} / {items.length}</p>
      <ul className="mt-3 space-y-2">
        {items.map((item, index) => (
          <li key={`${item.role}-${item.task}`}>
            <button type="button" className="flex w-full items-start gap-3 rounded-2xl bg-card p-3 text-left ring-1 ring-foreground/10" onClick={() => setItems(items.map((row, rowIndex) => rowIndex === index ? { ...row, done: !row.done } : row))}>
              <span className="mt-0.5 grid size-6 place-items-center rounded border border-foreground/20 text-sm">{item.done ? "✓" : ""}</span>
              <span><span className="text-xs text-muted-foreground">{item.role}</span><br />{item.task}<br /><span className="text-muted-foreground">{item.detail}</span></span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SurveyView({ state, setState }: { state: SurveyState; setState: (next: SurveyState) => void }) {
  const [draft, setDraft] = useState<Record<string, string>>({});
  return (
    <div className="space-y-4">
      <p className="text-sm">已有 {state.answers.length} 筆回覆</p>
      {state.questions.map((question) => {
        const values = state.answers.map((answer) => answer[question.id]).filter(Boolean);
        const scores = values.map(Number).filter((value) => Number.isFinite(value));
        const average = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
        return (
          <section key={question.id} className="rounded-2xl bg-card p-4 text-sm ring-1 ring-foreground/10">
            <p className="font-medium">{question.text}</p>
            <p className="mt-1 text-muted-foreground">{average == null ? `${values.length} 筆` : `平均 ${average.toFixed(1)}`}</p>
            <Input className="mt-2 h-11" aria-label={question.text} value={draft[question.id] ?? ""} onChange={(event) => setDraft({ ...draft, [question.id]: event.target.value })} placeholder={question.kind === "五分" ? "1 到 5" : question.kind === "是非" ? "是或否" : "寫一句"} />
          </section>
        );
      })}
      <Button type="button" className="h-11" onClick={() => { setState({ ...state, answers: [...state.answers, draft] }); setDraft({}); }}>
        存一筆回覆
      </Button>
    </div>
  );
}
