import type { Metadata } from "next";
import { ToolsBrowser } from "@/components/tools-browser";

export const metadata: Metadata = { title: "小工具" };

export default function ToolsPage() {
  return (
    <article className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <h1 className="text-3xl font-semibold tracking-tight">小工具</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">房租、外送、毛利、走道，在瀏覽器裡算完。在這頁就能搜。</p>
      <div className="mt-6">
        <ToolsBrowser />
      </div>
    </article>
  );
}
