export type DashSystem = { name: string; kind: "公司" | "個人"; since: string };
export type EventKind = "系統上線" | "工作方法" | "AI助理" | "內容產線" | "成長" | "踩雷";
export type DashEvent = { date: string; title: string; detail: string; kind: EventKind };
export type DashPoint = { date: string; count: number };

export const SYSTEMS: DashSystem[] = [
  { name: "叫貨", kind: "公司", since: "2025-08-01" },
  { name: "庫存盤點", kind: "公司", since: "2025-08-20" },
  { name: "排班", kind: "公司", since: "2025-09-03" },
  { name: "營收報表", kind: "公司", since: "2025-09-18" },
  { name: "菜單成本", kind: "公司", since: "2025-10-02" },
  { name: "集點", kind: "公司", since: "2025-10-16" },
  { name: "評論整理", kind: "公司", since: "2025-11-01" },
  { name: "記帳", kind: "公司", since: "2025-11-08" },
  { name: "文案草稿本", kind: "個人", since: "2025-07-11" },
  { name: "班表試算", kind: "個人", since: "2025-09-27" },
  { name: "照片命名", kind: "個人", since: "2026-01-09" },
  { name: "問卷草稿", kind: "個人", since: "2026-03-04" },
];

export const EVENTS: DashEvent[] = [
  { date: "2025-06-02", title: "開始用 AI 看店", detail: "先拿一間店的叫貨表試，不一次改全部。", kind: "AI助理" },
  { date: "2025-07-20", title: "把整本手冊一次貼進對話", detail: "漏了中間的檢查，後來改成一段一段問。", kind: "踩雷" },
  { date: "2025-08-01", title: "叫貨改成自己的表", detail: "廠商、品項、數量、日期四欄固定下來。", kind: "系統上線" },
  { date: "2025-09-18", title: "打烊只記四個數字", detail: "營業額、來客、外送、食材進貨。", kind: "工作方法" },
  { date: "2025-10-16", title: "集點規則寫上櫃檯", detail: "滿十點換小菜，先算成本再宣布。", kind: "系統上線" },
  { date: "2025-11-08", title: "支出開始分類", detail: "食材、房租、人事、水電、包材分開。", kind: "工作方法" },
  { date: "2026-01-20", title: "第二間店複製早班表", detail: "不重寫 SOP，只改店名和人數。", kind: "成長" },
  { date: "2026-03-12", title: "廣告同時換了圖和文案", detail: "七天後不知道是哪一個有效，後來改成一週只換一件。", kind: "踩雷" },
  { date: "2026-04-08", title: "廣告一週只測一件事", detail: "停掉沒人點的素材，不同時換文案和受眾。", kind: "工作方法" },
  { date: "2026-07-15", title: "團購寫明出貨日", detail: "冷凍品先寫保存天數，再開放下單。", kind: "內容產線" },
  { date: "2026-09-02", title: "會員日一個月一次", detail: "名單用電話找，不用綽號。", kind: "成長" },
  { date: "2026-11-01", title: "教材改成訂閱者站", detail: "系統放在同一站，打開就能用。", kind: "內容產線" },
];

export const SUBS: DashPoint[] = [
  { date: "2025-07", count: 18 },
  { date: "2025-09", count: 36 },
  { date: "2025-11", count: 52 },
  { date: "2026-01", count: 71 },
  { date: "2026-03", count: 90 },
  { date: "2026-05", count: 114 },
  { date: "2026-07", count: 138 },
  { date: "2026-09", count: 161 },
  { date: "2026-11", count: 186 },
];
