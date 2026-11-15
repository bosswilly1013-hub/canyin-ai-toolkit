import type { TopicId } from "@/lib/member/topics";

export type DownloadKind = "原始碼" | "HTML工具" | "PDF" | "其他";

export type DownloadFile = {
  name: string;
  href: string;
  kind: DownloadKind;
  topic: TopicId;
  article: string;
  description: string;
  bytes: number;
  open?: string;
};

export const downloads: DownloadFile[] = [
  { name: "report.html", href: "/downloads/report.html", kind: "HTML工具", topic: "finance", article: "fi-month", description: "門市十二個月和公司損益。數字存在這台裝置，可匯入匯出。", bytes: 10934, open: "/downloads/report.html" },
  { name: "flow.html", href: "/downloads/flow.html", kind: "HTML工具", topic: "shop", article: "sh-page", description: "一天的店務順序，可勾選、寫備註、匯出。", bytes: 2878, open: "/downloads/flow.html" },
  { name: "ad-week.xlsx", href: "/downloads/ad-week.xlsx", kind: "其他", topic: "ads", article: "ad-stop", description: "每週素材、花費、到店、停或不停。", bytes: 16238 },
  { name: "audit-ten.pdf", href: "/downloads/audit-ten.pdf", kind: "PDF", topic: "expand", article: "ex-audit", description: "早班稽核怎麼查，一頁。", bytes: 6840 },
  { name: "break-even-sheet.xlsx", href: "/downloads/break-even-sheet.xlsx", kind: "其他", topic: "tools", article: "rent-first", description: "損益兩平要填的六個數字，對照網頁工具。", bytes: 16229, open: "/downloads/break-even.html" },
  { name: "break-even.html", href: "/downloads/break-even.html", kind: "HTML工具", topic: "tools", article: "tool-be", description: "房租人事換算一天要幾位。數字存在這台裝置。", bytes: 6656, open: "/downloads/break-even.html" },
  { name: "close-check.html", href: "/downloads/close-check.html", kind: "HTML工具", topic: "finance", article: "fi-safe", description: "打烊勾選。勾過的項目存在這台裝置。", bytes: 1254, open: "/downloads/close-check.html" },
  { name: "close-checklist.pdf", href: "/downloads/close-checklist.pdf", kind: "PDF", topic: "finance", article: "close-four", description: "打烊六項，一頁。", bytes: 9119 },
  { name: "close-four.csv", href: "/downloads/close-four.csv", kind: "其他", topic: "finance", article: "close-four", description: "打烊四個數字。", bytes: 82, open: "/systems/sales/" },
  { name: "cost-card.xlsx", href: "/downloads/cost-card.xlsx", kind: "其他", topic: "finance", article: "fi-card", description: "一道菜的售價、用量、進價。", bytes: 16227 },
  { name: "delivery-calc.html", href: "/downloads/delivery-calc.html", kind: "HTML工具", topic: "tools", article: "delivery-price", description: "外送價試算。數字存在這台裝置。", bytes: 6628, open: "/downloads/delivery-calc.html" },
  { name: "delivery-price.csv", href: "/downloads/delivery-price.csv", kind: "其他", topic: "tools", article: "delivery-price", description: "外送價試算前要填的欄。", bytes: 66, open: "/downloads/delivery-calc.html" },
  { name: "discount-people.csv", href: "/downloads/discount-people.csv", kind: "其他", topic: "mind", article: "discount-people", description: "打折後要多幾位客人才打平。", bytes: 51 },
  { name: "district.html", href: "/downloads/district.html", kind: "HTML工具", topic: "tools", article: "tool-district", description: "商圈步行圈三百、五百、八百公尺。選擇存在這台裝置。", bytes: 5663, open: "/downloads/district.html" },
  { name: "floor.html", href: "/downloads/floor.html", kind: "HTML工具", topic: "tools", article: "tool-floor", description: "拖桌子、填走道。不到七十五公分會提醒。位置存在這台裝置。", bytes: 9283, open: "/downloads/floor.html" },
  { name: "food-cost.html", href: "/downloads/food-cost.html", kind: "HTML工具", topic: "finance", article: "margin-weekly", description: "一道菜的食材比。存在這台裝置。", bytes: 1478, open: "/downloads/food-cost.html" },
  { name: "food-safety-card.pdf", href: "/downloads/food-safety-card.pdf", kind: "PDF", topic: "finance", article: "fi-safe", description: "食安五項，一頁。", bytes: 7355 },
  { name: "food-safety.xlsx", href: "/downloads/food-safety.xlsx", kind: "其他", topic: "finance", article: "fi-safe", description: "打烊時的食安勾選。", bytes: 16230 },
  { name: "group-buy.xlsx", href: "/downloads/group-buy.xlsx", kind: "其他", topic: "shop", article: "sh-page", description: "團購人份、出貨日、重量、運費。", bytes: 16239 },
  { name: "guests-by-hour.xlsx", href: "/downloads/guests-by-hour.xlsx", kind: "其他", topic: "finance", article: "close-four", description: "時段來客，內用和外送分開。", bytes: 16157, open: "/systems/sales/" },
  { name: "handoff-card.pdf", href: "/downloads/handoff-card.pdf", kind: "PDF", topic: "people", article: "pe-handoff", description: "交班只寫三件，一頁。", bytes: 6315 },
  { name: "handoff.xlsx", href: "/downloads/handoff.xlsx", kind: "其他", topic: "people", article: "pe-handoff", description: "交班未完成的三件和接手的人。", bytes: 16168 },
  { name: "interview-card.pdf", href: "/downloads/interview-card.pdf", kind: "PDF", topic: "people", article: "pe-interview", description: "面試三題，一頁。", bytes: 6925 },
  { name: "interview.xlsx", href: "/downloads/interview.xlsx", kind: "其他", topic: "people", article: "pe-interview", description: "面試只留三題的紀錄。", bytes: 16277 },
  { name: "leave.csv", href: "/downloads/leave.csv", kind: "其他", topic: "people", article: "leave-one-sheet", description: "請假、時段、代理人。", bytes: 68 },
  { name: "members.xlsx", href: "/downloads/members.xlsx", kind: "其他", topic: "loyalty", article: "search-phone", description: "會員電話、最近來店、內用或外送。", bytes: 16185, open: "/systems/members/" },
  { name: "month-report.xlsx", href: "/downloads/month-report.xlsx", kind: "其他", topic: "finance", article: "fi-month", description: "一個月一列：營業額、食材、房租、人事、其他。", bytes: 16236 },
  { name: "new-store-thirty.pdf", href: "/downloads/new-store-thirty.pdf", kind: "PDF", topic: "expand", article: "first-thirty", description: "新店三十天只看三個數字，一頁。", bytes: 7254 },
  { name: "open-check.pdf", href: "/downloads/open-check.pdf", kind: "PDF", topic: "ai", article: "ai-two-weeks", description: "開門五項，一頁。", bytes: 7301 },
  { name: "open-sop.xlsx", href: "/downloads/open-sop.xlsx", kind: "其他", topic: "ai", article: "ai-two-weeks", description: "開門步驟打勾表。", bytes: 16095 },
  { name: "order-columns.csv", href: "/downloads/order-columns.csv", kind: "其他", topic: "buy", article: "order-columns", description: "跟叫貨表同一組欄位的 CSV，給不想開 Excel 的人。", bytes: 85 },
  { name: "order-sheet.xlsx", href: "/downloads/order-sheet.xlsx", kind: "其他", topic: "buy", article: "order-columns", description: "叫貨六欄，含一列示範。可改成自己的廠商和品項。", bytes: 16233 },
  { name: "par-level.csv", href: "/downloads/par-level.csv", kind: "其他", topic: "buy", article: "buy-par", description: "三日用量和安全量。", bytes: 56 },
  { name: "points-rule.csv", href: "/downloads/points-rule.csv", kind: "其他", topic: "loyalty", article: "rule-on-counter", description: "集點規則：多少錢一點、換什麼、幾個月有效。", bytes: 70 },
  { name: "position.html", href: "/downloads/position.html", kind: "HTML工具", topic: "tools", article: "tool-position", description: "價格和份量兩軸。位置存在這台裝置。", bytes: 9243, open: "/downloads/position.html" },
  { name: "prompt-complaint.txt", href: "/downloads/prompt-complaint.txt", kind: "原始碼", topic: "mind", article: "short-reply", description: "客訴三句：道歉、問哪一道、留聯絡方式。", bytes: 91 },
  { name: "prompt-hire.txt", href: "/downloads/prompt-hire.txt", kind: "原始碼", topic: "people", article: "hire-eighty", description: "徵人八十個字，必含時段和時薪。", bytes: 118 },
  { name: "prompt-order.txt", href: "/downloads/prompt-order.txt", kind: "原始碼", topic: "buy", article: "order-columns", description: "把叫貨文字收成六欄，不估算空白。", bytes: 169 },
  { name: "prompt-pack.txt", href: "/downloads/prompt-pack.txt", kind: "原始碼", topic: "claude", article: "save-the-prompt", description: "評論、徵人、公告，問對過的提示詞。", bytes: 161 },
  { name: "prompt-review.txt", href: "/downloads/prompt-review.txt", kind: "原始碼", topic: "claude", article: "reply-review", description: "依星等寫一句，四十字內。", bytes: 136 },
  { name: "prompt-shift.txt", href: "/downloads/prompt-shift.txt", kind: "原始碼", topic: "people", article: "shift-question", description: "只處理一個時段，不發明名單以外的人。", bytes: 106 },
  { name: "prompt-social.txt", href: "/downloads/prompt-social.txt", kind: "原始碼", topic: "social", article: "three-posts", description: "一週三則，每則四十字。", bytes: 112 },
  { name: "prompt-sop.txt", href: "/downloads/prompt-sop.txt", kind: "原始碼", topic: "claude", article: "check-sop-gap", description: "不重寫手冊，只找可能漏掉的檢查。", bytes: 88 },
  { name: "quote-two.csv", href: "/downloads/quote-two.csv", kind: "其他", topic: "buy", article: "buy-quote", description: "同一品項兩家報價。", bytes: 91 },
  { name: "receive-diff.xlsx", href: "/downloads/receive-diff.xlsx", kind: "其他", topic: "buy", article: "receive-diff", description: "只記叫貨和實收不一樣的列。", bytes: 16228 },
  { name: "review-staff.xlsx", href: "/downloads/review-staff.xlsx", kind: "其他", topic: "people", article: "pe-score", description: "每週一件做對、一件出錯。", bytes: 16206 },
  { name: "route.html", href: "/downloads/route.html", kind: "HTML工具", topic: "tools", article: "tool-route", description: "送貨路線：最近的下一家、導航、複製給 LINE。站點存在這台裝置。", bytes: 17169, open: "/downloads/route.html" },
  { name: "second-store.csv", href: "/downloads/second-store.csv", kind: "其他", topic: "expand", article: "copy-opening", description: "第二間店哪些沿用、哪些只改人數。", bytes: 73 },
  { name: "shadow-week.xlsx", href: "/downloads/shadow-week.xlsx", kind: "其他", topic: "people", article: "shadow-week", description: "新人跟班第幾天，開門備料打烊會不會。", bytes: 16229 },
  { name: "skill-close.zip", href: "/downloads/skill-close.zip", kind: "原始碼", topic: "finance", article: "close-four", description: "把打烊記事收成四個數字的技能。", bytes: 552 },
  { name: "skill-hire.zip", href: "/downloads/skill-hire.zip", kind: "原始碼", topic: "people", article: "hire-eighty", description: "徵人短文的技能。", bytes: 498 },
  { name: "skill-order.zip", href: "/downloads/skill-order.zip", kind: "原始碼", topic: "buy", article: "order-columns", description: "Claude 用的叫貨整理技能，裡面是 SKILL.md。", bytes: 546 },
  { name: "skill-review.zip", href: "/downloads/skill-review.zip", kind: "原始碼", topic: "claude", article: "reply-review", description: "評論起草的技能，留給人改兩個字再貼。", bytes: 510 },
  { name: "skill-shift.zip", href: "/downloads/skill-shift.zip", kind: "原始碼", topic: "people", article: "shift-question", description: "單一時段排班的技能。", bytes: 486 },
  { name: "skill-sop.zip", href: "/downloads/skill-sop.zip", kind: "原始碼", topic: "ai", article: "split-sop", description: "只找 SOP 漏洞、不重寫整本的技能。", bytes: 470 },
  { name: "social-calendar.csv", href: "/downloads/social-calendar.csv", kind: "其他", topic: "social", article: "so-cal", description: "一個月十二則的日期和主題。", bytes: 51 },
  { name: "stock-count.xlsx", href: "/downloads/stock-count.xlsx", kind: "其他", topic: "buy", article: "buy-par", description: "庫存盤點：帳上、實盤、差。", bytes: 16221 },
  { name: "targets.html", href: "/downloads/targets.html", kind: "HTML工具", topic: "mind", article: "mi-target-day", description: "月目標拆成每天、午、晚。存在這台裝置。", bytes: 9153, open: "/downloads/targets.html" },
  { name: "temp-card.pdf", href: "/downloads/temp-card.pdf", kind: "PDF", topic: "finance", article: "fi-temp", description: "溫度一天兩次的一頁說明。", bytes: 8316 },
  { name: "temp-log.xlsx", href: "/downloads/temp-log.xlsx", kind: "其他", topic: "finance", article: "fi-temp", description: "冰箱溫度一天兩次。", bytes: 16167 },
  { name: "vendor-phone.csv", href: "/downloads/vendor-phone.csv", kind: "其他", topic: "buy", article: "buy-vendor", description: "廠商電話和對帳日。不要貼進對話。", bytes: 58 },
  { name: "wage.html", href: "/downloads/wage.html", kind: "HTML工具", topic: "people", article: "wage-hours", description: "時薪乘時數。存在這台裝置。", bytes: 1392, open: "/downloads/wage.html" },
  { name: "waste.csv", href: "/downloads/waste.csv", kind: "其他", topic: "finance", article: "fi-waste", description: "報廢原因和進價金額。", bytes: 68 },
  { name: "week-shift.xlsx", href: "/downloads/week-shift.xlsx", kind: "其他", topic: "people", article: "wage-hours", description: "一週班表加時薪，用來看這週人力貴不貴。", bytes: 16388, open: "/systems/schedule/" },
];

export const downloadKinds: DownloadKind[] = ["原始碼", "HTML工具", "PDF", "其他"];

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}
