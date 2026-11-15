import type { Metadata } from "next";
import { AskPanel } from "@/components/ask-panel";
import { MarkSeen } from "@/components/mark-seen";

export const metadata: Metadata = {
  title: "AI 問答",
  description: "用語句問開店問題。數字一律用工具算。",
};

export default function AskPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <MarkSeen href="/ask" />
      <p className="text-sm font-medium text-primary">AI 系統</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">AI 問答</h1>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        這個工具幫你把問題講清楚，並指向該用的計算頁。它不計算損益、定價或毛利。沒有設定金鑰時，對話框會收起來，其餘工具照常使用。
      </p>
      <div className="mt-6">
        <AskPanel />
      </div>
    </article>
  );
}
