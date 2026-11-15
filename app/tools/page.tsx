import type { Metadata } from "next";
import { ToolsBrowser } from "@/components/tools-browser";

export const metadata: Metadata = { title: "全部工具" };

export default function ToolsPage() {
  return (
    <article className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <h1 className="text-3xl font-semibold tracking-tight">全部工具</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">每一張卡片是一件具體的事。在這頁就能搜，不用先去搜尋頁。</p>
      <div className="mt-6">
        <ToolsBrowser />
      </div>
    </article>
  );
}
