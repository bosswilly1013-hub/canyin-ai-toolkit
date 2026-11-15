import { findHeader, parseLooseOrderNumber, parseOrderDate, rowsFromMatrix, summarizeOrders } from "@/lib/order-sheet";

export type AppId =
  | "orders"
  | "stock"
  | "schedule"
  | "sales"
  | "menu"
  | "members"
  | "reviews"
  | "expenses"
  | "sop"
  | "survey";

export type AppInfo = {
  id: AppId;
  name: string;
  help: string;
  upload: string;
};

export const apps: AppInfo[] = [
  { id: "orders", name: "叫貨", help: "看平常叫多少，寫今天的叫貨單，複製給廠商。", upload: "叫貨紀錄（廠商、品項、數量、日期）" },
  { id: "stock", name: "庫存盤點", help: "對帳面和實盤，差多少一眼看到。", upload: "品項與帳面數量" },
  { id: "schedule", name: "排班", help: "排一週的班，算出工時和薪資。", upload: "員工姓名和時薪" },
  { id: "sales", name: "營收報表", help: "看每天、週間、品項和通路的營業。", upload: "每日銷售（日期、品項、金額）" },
  { id: "menu", name: "菜單成本", help: "算出一道菜的成本和毛利，該賣多少。", upload: "菜名、售價、食材用量和單價" },
  { id: "members", name: "集點", help: "用電話找到客人，加點或扣點。", upload: "會員姓名、電話、點數" },
  { id: "reviews", name: "評論整理", help: "看星等和關鍵字，複製回覆。", upload: "評論（星等、內容）" },
  { id: "expenses", name: "記帳", help: "把支出分類，看每個月花在哪。", upload: "日期、項目、分類、金額" },
  { id: "sop", name: "員工清單", help: "早班、打烊的步驟，做完就打勾。", upload: "職務和步驟" },
  { id: "survey", name: "滿意度", help: "收集客人回覆，看平均分數。", upload: "題目，或一列一筆回覆" },
];

export function getApp(id: string) {
  return apps.find((item) => item.id === id);
}

export function missing(name: string, headers: string) {
  return `缺少「${name}」欄。第一列請包含：${headers}。`;
}

function headerIndex(headers: string[], names: string[]) {
  const wanted = new Set(names.map((name) => name.toLowerCase()));
  return headers.findIndex((header) => wanted.has(header.replace(/[\s\u3000]/g, "").replace(/[（(][^）)]*[）)]/g, "").toLowerCase()));
}

function table(matrix: unknown[][], required: { key: string; label: string; names: string[] }[], labelList: string): { error: string } | { headers: string[]; map: Record<string, number>; rows: unknown[][] } {
  const limit = Math.min(matrix.length, 8);
  let headerAt = 0;
  let headers = (matrix[0] || []).map((cell) => String(cell ?? "").trim());
  for (let i = 0; i < limit; i++) {
    const row = (matrix[i] || []).map((cell) => String(cell ?? "").trim());
    const hits = required.filter((field) => headerIndex(row, field.names) >= 0).length;
    if (hits >= Math.min(2, required.length)) {
      headerAt = i;
      headers = row;
      break;
    }
  }
  const map: Record<string, number> = {};
  for (const field of required) {
    const index = headerIndex(headers, field.names);
    if (index < 0) return { error: missing(field.label, labelList) };
    map[field.key] = index;
  }
  const rows = matrix.slice(headerAt + 1).filter((row) => (row || []).some((cell) => String(cell ?? "").trim()));
  return { headers, map, rows };
}

export type HistLine = {
  date: string;
  vendor: string;
  item: string;
  unit: string;
  price: number;
  qty: number;
  received: number | null;
};

export type DraftLine = {
  vendor: string;
  item: string;
  unit: string;
  price: number;
  suggested: number;
  qty: number;
};

export type OrderBook = { history: HistLine[]; draft: DraftLine[] };

export function draftFromHistory(history: HistLine[]): DraftLine[] {
  const summary = summarizeOrders(
    history.map((line, index) => ({
      line: index + 1,
      vendor: line.vendor,
      item: line.item,
      unit: line.unit,
      price: line.price,
      qty: line.qty,
      date: line.date,
      dateWarning: false,
    })),
  );
  return summary.vendors.flatMap((vendor) =>
    vendor.items.map((item) => ({
      vendor: vendor.name,
      item: item.name,
      unit: item.unit,
      price: item.price,
      suggested: item.suggested,
      qty: item.suggested,
    })),
  );
}

export function parseOrderSheet(matrix: unknown[][]): { ok: true; value: OrderBook } | { ok: false; error: string } {
  const found = findHeader(matrix);
  if (found.mapping.vendor < 0 || found.mapping.item < 0) return { ok: false, error: missing("廠商或品項", "廠商、品項、單位、單價、數量、日期") };
  const parsed = rowsFromMatrix(matrix, found.mapping, found.headerIndex);
  if (!parsed.rows.length) return { ok: false, error: "沒有讀到任何一列。請確認有廠商和品項。" };
  const history: HistLine[] = parsed.rows.map((row) => ({
    date: row.date,
    vendor: row.vendor,
    item: row.item,
    unit: row.unit,
    price: row.price,
    qty: row.qty,
    received: null,
  }));
  return { ok: true, value: { history, draft: draftFromHistory(history) } };
}

export function lineMessage(vendor: string, lines: DraftLine[], date: string) {
  const mine = lines.filter((line) => line.vendor === vendor && line.qty > 0);
  const body = mine.map((line) => `・${line.item} ${line.qty}${line.unit}`).join("\n");
  return `【叫貨】${date}\n${vendor}\n${body}`;
}

export function monthReport(history: HistLine[]) {
  const map = new Map<string, { month: string; vendor: string; item: string; qty: number; amount: number }>();
  for (const line of history) {
    if (!line.date || !(line.qty > 0)) continue;
    const month = line.date.slice(0, 7);
    const key = `${month}\0${line.vendor}\0${line.item}`;
    const row = map.get(key) ?? { month, vendor: line.vendor, item: line.item, qty: 0, amount: 0 };
    row.qty = Math.round((row.qty + line.qty) * 1000) / 1000;
    row.amount = Math.round((row.amount + line.qty * line.price) * 100) / 100;
    map.set(key, row);
  }
  return [...map.values()].sort((a, b) => a.month.localeCompare(b.month) || a.vendor.localeCompare(b.vendor, "zh-Hant"));
}

export const sampleOrders: (string | number)[][] = [
  ["廠商", "品項", "單位", "單價", "數量", "日期"],
  ["鮮達蔬果", "高麗菜", "顆", 45, 6, "2026-10-01"],
  ["鮮達蔬果", "青蔥", "把", 30, 3, "2026-10-01"],
  ["大成肉品", "雞腿排", "公斤", 95, 8, "2026-10-01"],
  ["鮮達蔬果", "高麗菜", "顆", 48, 4, "2026-10-08"],
  ["大成肉品", "雞腿排", "公斤", 98, 6, "2026-10-08"],
  ["鮮達蔬果", "高麗菜", "顆", 50, 5, "114/11/03"],
  ["海鮮行", "白蝦", "台斤", 180, 2, "2026-11-05"],
];

export type StockItem = { name: string; unit: string; book: number; actual: number | null };
export function parseStock(matrix: unknown[][]) {
  const parsed = table(matrix, [
    { key: "name", label: "品項", names: ["品項", "品名", "名稱"] },
    { key: "unit", label: "單位", names: ["單位"] },
    { key: "book", label: "帳面數量", names: ["帳面數量", "帳面", "庫存"] },
  ], "品項、單位、帳面數量");
  if ("error" in parsed) return { ok: false as const, error: parsed.error };
  const items: StockItem[] = [];
  for (const row of parsed.rows) {
    const name = String(row[parsed.map.name] ?? "").trim();
    if (!name) continue;
    const book = parseLooseOrderNumber(row[parsed.map.book]);
    if (book == null) return { ok: false as const, error: `「${name}」的帳面數量看不懂。` };
    const actualIndex = headerIndex(parsed.headers, ["實盤數量", "實盤"]);
    const actualRaw = actualIndex < 0 ? "" : row[actualIndex];
    const actual = String(actualRaw ?? "").trim() === "" ? null : parseLooseOrderNumber(actualRaw);
    items.push({ name, unit: String(row[parsed.map.unit] ?? "").trim(), book, actual });
  }
  if (!items.length) return { ok: false as const, error: "沒有讀到品項。" };
  return { ok: true as const, value: items };
}
export const sampleStock: (string | number)[][] = [
  ["品項", "單位", "帳面數量", "實盤數量"],
  ["高麗菜", "顆", 8, 6],
  ["青蔥", "把", 4, 4],
  ["雞腿排", "公斤", 3.5, ""],
  ["雞蛋", "顆", 30, 28],
];

export type Staff = { name: string; role: string; wage: number };
export type Schedule = { staff: Staff[]; hours: number[][] };
export function parseSchedule(matrix: unknown[][]) {
  const parsed = table(matrix, [
    { key: "name", label: "姓名", names: ["姓名", "員工", "名字"] },
    { key: "wage", label: "時薪", names: ["時薪", "時薪元"] },
  ], "姓名、時薪");
  if ("error" in parsed) return { ok: false as const, error: parsed.error };
  const roleIndex = headerIndex(parsed.headers, ["職務", "職位"]);
  const staff: Staff[] = [];
  for (const row of parsed.rows) {
    const name = String(row[parsed.map.name] ?? "").trim();
    if (!name) continue;
    const wage = parseLooseOrderNumber(row[parsed.map.wage]);
    if (wage == null) return { ok: false as const, error: `「${name}」的時薪看不懂。` };
    staff.push({ name, role: roleIndex < 0 ? "" : String(row[roleIndex] ?? "").trim(), wage });
  }
  if (!staff.length) return { ok: false as const, error: "沒有讀到員工。" };
  return { ok: true as const, value: { staff, hours: staff.map(() => [0, 8, 8, 8, 8, 8, 4]) } satisfies Schedule };
}
export const sampleStaff: (string | number)[][] = [
  ["姓名", "職務", "時薪"],
  ["小美", "外場", 196],
  ["阿國", "外場", 196],
  ["阿財", "廚房", 220],
];

export type Sale = { date: string; item: string; qty: number; amount: number; channel: string };
export function parseSales(matrix: unknown[][]) {
  const parsed = table(matrix, [
    { key: "date", label: "日期", names: ["日期", "營業日"] },
    { key: "amount", label: "金額", names: ["金額", "營業額", "銷售額"] },
  ], "日期、金額");
  if ("error" in parsed) return { ok: false as const, error: parsed.error };
  const itemIndex = headerIndex(parsed.headers, ["品項", "品名", "商品"]);
  const qtyIndex = headerIndex(parsed.headers, ["數量"]);
  const channelIndex = headerIndex(parsed.headers, ["通路", "渠道", "來源"]);
  const rows: Sale[] = [];
  for (const row of parsed.rows) {
    const date = parseOrderDate(row[parsed.map.date]);
    const amount = parseLooseOrderNumber(row[parsed.map.amount]);
    if (!date || amount == null) continue;
    rows.push({
      date,
      item: itemIndex < 0 ? "未分品項" : String(row[itemIndex] ?? "").trim() || "未分品項",
      qty: qtyIndex < 0 ? 0 : parseLooseOrderNumber(row[qtyIndex]) || 0,
      amount,
      channel: channelIndex < 0 ? "店內" : String(row[channelIndex] ?? "").trim() || "店內",
    });
  }
  if (!rows.length) return { ok: false as const, error: "沒有讀到有效的日期和金額。" };
  return { ok: true as const, value: rows };
}
export const sampleSales: (string | number)[][] = [
  ["日期", "品項", "數量", "金額", "通路"],
  ["2026-11-02", "紅燒牛肉麵", 40, 7200, "店內"],
  ["2026-11-02", "紅燒牛肉麵", 12, 2520, "外送"],
  ["2026-11-03", "陽春麵", 28, 3080, "店內"],
  ["2026-11-07", "紅燒牛肉麵", 62, 11160, "店內"],
  ["2026-11-08", "小菜拼盤", 20, 2400, "店內"],
];

export type RecipeRow = { dish: string; price: number; ingredient: string; qty: number; unitPrice: number };
export function parseMenu(matrix: unknown[][]) {
  const parsed = table(matrix, [
    { key: "dish", label: "菜名", names: ["菜名", "品項", "品名"] },
    { key: "price", label: "售價", names: ["售價", "價格"] },
    { key: "ingredient", label: "食材", names: ["食材", "原料"] },
    { key: "qty", label: "用量", names: ["用量", "數量"] },
    { key: "unitPrice", label: "食材單價", names: ["食材單價", "單價", "進價"] },
  ], "菜名、售價、食材、用量、食材單價");
  if ("error" in parsed) return { ok: false as const, error: parsed.error };
  const rows: RecipeRow[] = [];
  for (const row of parsed.rows) {
    const dish = String(row[parsed.map.dish] ?? "").trim();
    const ingredient = String(row[parsed.map.ingredient] ?? "").trim();
    if (!dish || !ingredient) continue;
    const price = parseLooseOrderNumber(row[parsed.map.price]);
    const qty = parseLooseOrderNumber(row[parsed.map.qty]);
    const unitPrice = parseLooseOrderNumber(row[parsed.map.unitPrice]);
    if (price == null || qty == null || unitPrice == null) return { ok: false as const, error: `「${dish}／${ingredient}」的數字看不懂。` };
    rows.push({ dish, price, ingredient, qty, unitPrice });
  }
  if (!rows.length) return { ok: false as const, error: "沒有讀到食譜。" };
  return { ok: true as const, value: rows };
}
export function dishesOf(rows: RecipeRow[]) {
  const map = new Map<string, { dish: string; price: number; cost: number }>();
  for (const row of rows) {
    const current = map.get(row.dish) ?? { dish: row.dish, price: row.price, cost: 0 };
    current.price = row.price;
    current.cost = Math.round((current.cost + row.qty * row.unitPrice) * 100) / 100;
    map.set(row.dish, current);
  }
  return [...map.values()].map((dish) => ({
    ...dish,
    margin: dish.price > 0 ? (dish.price - dish.cost) / dish.price : 0,
    suggest: dish.cost > 0 ? Math.ceil((dish.cost / 0.35) / 10) * 10 : 0,
  }));
}
export const sampleMenu: (string | number)[][] = [
  ["菜名", "售價", "食材", "用量", "食材單價"],
  ["紅燒牛肉麵", 180, "牛腱", 0.15, 420],
  ["紅燒牛肉麵", 180, "麵條", 0.2, 40],
  ["紅燒牛肉麵", 180, "青菜", 0.08, 50],
  ["陽春麵", 90, "麵條", 0.2, 40],
  ["陽春麵", 90, "青菜", 0.08, 50],
];

export type Member = { name: string; phone: string; points: number };
export function parseMembers(matrix: unknown[][]) {
  const parsed = table(matrix, [
    { key: "name", label: "姓名", names: ["姓名", "客人"] },
    { key: "phone", label: "電話", names: ["電話", "手機"] },
  ], "姓名、電話");
  if ("error" in parsed) return { ok: false as const, error: parsed.error };
  const pointsIndex = headerIndex(parsed.headers, ["點數", "集點"]);
  const members: Member[] = [];
  for (const row of parsed.rows) {
    const name = String(row[parsed.map.name] ?? "").trim();
    const phone = String(row[parsed.map.phone] ?? "").trim().replace(/\s/g, "");
    if (!name || !phone) continue;
    const points = pointsIndex < 0 || String(row[pointsIndex] ?? "").trim() === "" ? 0 : parseLooseOrderNumber(row[pointsIndex]);
    if (points == null) return { ok: false as const, error: `「${name}」的點數看不懂。` };
    members.push({ name, phone, points });
  }
  if (!members.length) return { ok: false as const, error: "沒有讀到會員。" };
  return { ok: true as const, value: members };
}
export const sampleMembers: (string | number)[][] = [
  ["姓名", "電話", "點數"],
  ["王小美", "0912000111", 6],
  ["陳先生", "0922333444", 2],
  ["林小姐", "0933555666", 9],
];

export type Review = { date: string; stars: number; text: string; source: string };
const reviewWords = ["湯", "麵", "服務", "等", "份量", "乾淨", "貴", "香菜", "態度", "停車"];
export function parseReviews(matrix: unknown[][]) {
  const parsed = table(matrix, [
    { key: "stars", label: "星等", names: ["星等", "星星", "評分"] },
    { key: "text", label: "內容", names: ["內容", "評論", "文字"] },
  ], "星等、內容");
  if ("error" in parsed) return { ok: false as const, error: parsed.error };
  const dateIndex = headerIndex(parsed.headers, ["日期"]);
  const sourceIndex = headerIndex(parsed.headers, ["平台", "來源"]);
  const reviews: Review[] = [];
  for (const row of parsed.rows) {
    const stars = parseLooseOrderNumber(row[parsed.map.stars]);
    const text = String(row[parsed.map.text] ?? "").trim();
    if (stars == null || stars < 1 || stars > 5 || !text) continue;
    reviews.push({
      date: dateIndex < 0 ? "" : parseOrderDate(row[dateIndex]),
      stars,
      text,
      source: sourceIndex < 0 ? "Google" : String(row[sourceIndex] ?? "").trim() || "Google",
    });
  }
  if (!reviews.length) return { ok: false as const, error: "沒有讀到評論。星等要 1 到 5。" };
  return { ok: true as const, value: reviews };
}
export function reviewTags(text: string) {
  return reviewWords.filter((word) => text.includes(word));
}
export function replyFor(stars: number) {
  if (stars >= 4) return "謝謝你來左營店，也謝謝你把好吃的地方寫下來。下次來跟店員說，湯給你續上。";
  if (stars === 3) return "謝謝你寫下這次的感覺。哪一道或哪一段讓你覺得普通，回這則訊息跟我們說，我們下次調。";
  return "對不起，這次沒有顧好。你方便告訴我們是哪一天、哪一道嗎？我們想補救，不是只回一句抱歉。";
}
export const sampleReviews: (string | number)[][] = [
  ["日期", "星等", "內容", "平台"],
  ["2026-11-02", 5, "牛肉麵湯頭很濃，服務也快。", "Google"],
  ["2026-11-03", 2, "等了四十分鐘，麵有點軟。", "Google"],
  ["2026-11-06", 4, "份量夠，就是停車不好停。", "Google"],
  ["2026-11-08", 3, "還可以，香菜偏多。", "Google"],
];

export type Expense = { date: string; title: string; category: string; amount: number };
export const expenseCategories = ["食材", "人事", "房租", "水電", "包材", "其他"];
export function parseExpenses(matrix: unknown[][]) {
  const parsed = table(matrix, [
    { key: "date", label: "日期", names: ["日期"] },
    { key: "title", label: "項目", names: ["項目", "摘要", "內容"] },
    { key: "amount", label: "金額", names: ["金額"] },
  ], "日期、項目、金額");
  if ("error" in parsed) return { ok: false as const, error: parsed.error };
  const categoryIndex = headerIndex(parsed.headers, ["分類", "類別"]);
  const rows: Expense[] = [];
  for (const row of parsed.rows) {
    const date = parseOrderDate(row[parsed.map.date]);
    const title = String(row[parsed.map.title] ?? "").trim();
    const amount = parseLooseOrderNumber(row[parsed.map.amount]);
    if (!date || !title || amount == null) continue;
    const category = categoryIndex < 0 ? "其他" : String(row[categoryIndex] ?? "").trim() || "其他";
    rows.push({ date, title, category, amount });
  }
  if (!rows.length) return { ok: false as const, error: "沒有讀到支出。日期請用 2026-11-01 或 114/11/01。" };
  return { ok: true as const, value: rows };
}
export const sampleExpenses: (string | number)[][] = [
  ["日期", "項目", "分類", "金額"],
  ["2026-11-01", "房租", "房租", 48000],
  ["2026-11-03", "鮮達蔬菜", "食材", 8600],
  ["2026-11-05", "瓦斯", "水電", 2400],
  ["2026-11-08", "外送紙袋", "包材", 960],
];

export type SopItem = { role: string; task: string; detail: string; done: boolean };
export function parseSop(matrix: unknown[][]) {
  const parsed = table(matrix, [
    { key: "role", label: "職務", names: ["職務", "班別"] },
    { key: "task", label: "步驟", names: ["步驟", "項目", "工作"] },
  ], "職務、步驟");
  if ("error" in parsed) return { ok: false as const, error: parsed.error };
  const detailIndex = headerIndex(parsed.headers, ["說明", "注意"]);
  const items: SopItem[] = [];
  for (const row of parsed.rows) {
    const role = String(row[parsed.map.role] ?? "").trim();
    const task = String(row[parsed.map.task] ?? "").trim();
    if (!role || !task) continue;
    items.push({ role, task, detail: detailIndex < 0 ? "" : String(row[detailIndex] ?? "").trim(), done: false });
  }
  if (!items.length) return { ok: false as const, error: "沒有讀到步驟。" };
  return { ok: true as const, value: items };
}
export const sampleSop: (string | number)[][] = [
  ["職務", "步驟", "說明"],
  ["早班", "開燈、開瓦斯", "進門先看瓦斯開關"],
  ["早班", "牛骨汆燙", "冷水下鍋，滾了再換水"],
  ["早班", "擦桌、對特餐價錢", "黑板上的價錢要和收銀機一樣"],
  ["打烊", "收油、拖地", "地溝要沖"],
  ["打烊", "關瓦斯、關燈", "最後一個走的人檢查"],
];

export type Question = { id: string; text: string; kind: "五分" | "是非" | "文字" };
export type SurveyState = { questions: Question[]; answers: Record<string, string>[] };
export function parseSurvey(matrix: unknown[][]): { ok: true; value: SurveyState } | { ok: false; error: string } {
  const headers = (matrix[0] || []).map((cell) => String(cell ?? "").trim());
  const answerCol = headerIndex(headers, ["答案", "回覆", "填答"]);
  const questionCol = headerIndex(headers, ["題目", "問題"]);
  if (answerCol >= 0 && questionCol >= 0) {
    const questions: Question[] = [];
    const byQuestion = new Map<string, string[]>();
    for (const row of matrix.slice(1)) {
      const text = String(row[questionCol] ?? "").trim();
      const answer = String(row[answerCol] ?? "").trim();
      if (!text || !answer) continue;
      if (!questions.some((item) => item.text === text)) {
        const kind = /^[1-5]$/.test(answer) ? "五分" : /^(是|否|會|不會)$/.test(answer) ? "是非" : "文字";
        questions.push({ id: `q${questions.length + 1}`, text, kind });
      }
      const list = byQuestion.get(text) ?? [];
      list.push(answer);
      byQuestion.set(text, list);
    }
    if (!questions.length) return { ok: false, error: "沒有讀到回覆。" };
    const count = Math.max(...questions.map((item) => (byQuestion.get(item.text) ?? []).length));
    const answers = Array.from({ length: count }, (_, index) => {
      const record: Record<string, string> = {};
      for (const question of questions) record[question.id] = (byQuestion.get(question.text) ?? [])[index] ?? "";
      return record;
    });
    return { ok: true, value: { questions, answers } };
  }
  const parsed = table(matrix, [{ key: "text", label: "題目", names: ["題目", "問題"] }], "題目、題型");
  if ("error" in parsed) return { ok: false, error: parsed.error };
  const kindIndex = headerIndex(parsed.headers, ["題型"]);
  const questions: Question[] = [];
  for (const row of parsed.rows) {
    const text = String(row[parsed.map.text] ?? "").trim();
    if (!text) continue;
    const raw = kindIndex < 0 ? "五分" : String(row[kindIndex] ?? "").trim();
    const kind = raw === "是非" || raw === "文字" ? raw : "五分";
    questions.push({ id: `q${questions.length + 1}`, text, kind });
  }
  if (!questions.length) return { ok: false, error: "沒有讀到題目。" };
  return { ok: true, value: { questions, answers: [] } };
}
export const sampleSurvey: (string | number)[][] = [
  ["題號", "題目", "題型"],
  ["Q1", "今天的湯，你覺得如何？", "五分"],
  ["Q2", "下次還會來嗎？", "是非"],
  ["Q3", "想跟店長說的話", "文字"],
];

export const samples: Record<AppId, (string | number)[][]> = {
  orders: sampleOrders,
  stock: sampleStock,
  schedule: sampleStaff,
  sales: sampleSales,
  menu: sampleMenu,
  members: sampleMembers,
  reviews: sampleReviews,
  expenses: sampleExpenses,
  sop: sampleSop,
  survey: sampleSurvey,
};

export function weekdayName(date: string) {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return ["日", "一", "二", "三", "四", "五", "六"][day] ?? "";
}
