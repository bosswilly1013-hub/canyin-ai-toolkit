export const topics = [
  { id: "ai", name: "AI 系統實作", blurb: "先列重複的事，再決定哪一件做成系統。" },
  { id: "claude", name: "Claude／ChatGPT 入門", blurb: "怎麼問，才不會得到一份不能用的菜單。" },
  { id: "tools", name: "開店小工具", blurb: "房租、外送、走道、毛利，先算再裝潢。" },
  { id: "buy", name: "叫貨採購", blurb: "表怎麼整理，驗收只記差的。" },
  { id: "people", name: "人事排班", blurb: "時薪乘上實際時數，週末不要只靠一個人。" },
  { id: "finance", name: "財務報表", blurb: "打烊四個數字，一個月一張表。" },
  { id: "ads", name: "廣告投放", blurb: "一週只測一件事，落地頁只留一個動作。" },
  { id: "social", name: "社群經營", blurb: "一週三則就夠，回覆留在當天。" },
  { id: "shop", name: "電商", blurb: "團購先寫出貨日和保存方式。" },
  { id: "loyalty", name: "會員經營", blurb: "集點規則寫在櫃檯，用電話找人。" },
  { id: "expand", name: "加盟展店", blurb: "第二間店複製表，不重寫整本手冊。" },
  { id: "mind", name: "經營觀念", blurb: "老闆薪水算進成本，一週只改一件事。" },
] as const;

export type TopicId = (typeof topics)[number]["id"];

export const learningPath = ["repeat-ten", "rent-first", "order-columns", "close-four", "one-change", "one-store"];
