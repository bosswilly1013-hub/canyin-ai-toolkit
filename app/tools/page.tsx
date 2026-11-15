import type { Metadata } from "next";
import { ToolCard } from "@/components/tool-card";
import { tools } from "@/lib/catalog";

export const metadata: Metadata = { title: "全部工具" };

export default function ToolsPage() {
  return (
    <article className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <h1 className="text-3xl font-semibold tracking-tight">全部工具</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">每一張卡片是一件具體的事。點進去就有填好的範例，結果寫在頁面上怎麼讀。</p>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </article>
  );
}
