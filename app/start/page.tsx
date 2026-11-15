import type { Metadata } from "next";
import { StartPath } from "@/components/start-path";

export const metadata: Metadata = {
  title: "新手入門",
  description: "七步走完兩平、菜單、外送、目標、報表、定位和平面圖。",
};

export default function StartPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <p className="text-sm font-medium text-primary">新手入門</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">先把店算懂，再談系統</h1>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        順序是故意的：不知道一個月要做多少，就先不要排廣告，也不要先上 ERP。每一步都連到一個可以動手的工具，範例已經填好。
      </p>
      <div className="mt-6">
        <StartPath />
      </div>
    </article>
  );
}
