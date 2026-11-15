import type { Metadata } from "next";
import { ToolsBrowser } from "@/components/tools-browser";

export const metadata: Metadata = { title: "小工具" };

export default function ToolsPage() {
  return (
    <article className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <h1 className="text-3xl font-semibold tracking-tight">小工具</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">房租、外送、走道、送貨、商圈、電商流程，和叫貨、庫存那些現成系統，都從這一頁進去。系統頁也列同一份。</p>
      <div className="mt-6">
        <ToolsBrowser />
      </div>
    </article>
  );
}
