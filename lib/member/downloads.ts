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
  {
    name: "叫貨六欄.csv",
    href: "/downloads/order-columns.csv",
    kind: "其他",
    topic: "buy",
    article: "order-columns",
    description: "廠商、品項、單位、單價、數量、日期。可直接改成自己的叫貨。",
    bytes: 83,
    open: "/systems/orders/",
  },
  {
    name: "打烊四個數字.csv",
    href: "/downloads/close-four.csv",
    kind: "其他",
    topic: "finance",
    article: "close-four",
    description: "每天打烊記營業額、來客、外送、食材。",
    bytes: 80,
    open: "/systems/sales/",
  },
  {
    name: "外送試算.html",
    href: "/downloads/delivery-calc.html",
    kind: "HTML工具",
    topic: "tools",
    article: "delivery-price",
    description: "單檔網頁。打開就能算外送價，不用安裝。",
    bytes: 947,
    open: "/downloads/delivery-calc.html",
  },
  {
    name: "打烊檢查.pdf",
    href: "/downloads/close-checklist.pdf",
    kind: "PDF",
    topic: "finance",
    article: "close-four",
    description: "打烊前對一遍的一頁檢查。",
    bytes: 399,
  },
  {
    name: "提示詞包.txt",
    href: "/downloads/prompt-pack.txt",
    kind: "原始碼",
    topic: "claude",
    article: "save-the-prompt",
    description: "問對過的評論、徵人、公告提示詞。",
    bytes: 120,
  },
];

export const downloadKinds: DownloadKind[] = ["原始碼", "HTML工具", "PDF", "其他"];

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}
