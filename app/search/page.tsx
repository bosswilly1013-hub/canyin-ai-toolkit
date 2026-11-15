import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchPanel } from "@/components/search-panel";

export const metadata: Metadata = { title: "搜尋" };

export default function SearchPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <h1 className="text-3xl font-semibold tracking-tight">全站搜尋</h1>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">找工具、短文，以及導覽裡的外部資源。搜尋在你的瀏覽器裡比對，不會送到別處。</p>
      <div className="mt-6">
        <Suspense fallback={<p className="text-sm text-muted-foreground">正在打開搜尋…</p>}>
          <SearchPanel />
        </Suspense>
      </div>
    </article>
  );
}
