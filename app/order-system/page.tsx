import type { Metadata } from "next";
import { OrderPreview } from "@/components/order-preview";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

export const metadata: Metadata = {
  title: "叫貨系統一鍵生成",
  description: "上傳自己的叫貨 Excel，變成你的廠商、品項和叫貨系統。",
};

const deployUrl = "https://render.com/deploy?repo=https://github.com/bosswilly1013-hub/procurement-hub";

export default function OrderSystemPage() {
  return (
    <article className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <p className="text-sm font-medium text-primary">現成系統 · 放上你的資料就能用</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">叫貨系統一鍵生成</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
        這不是教學卡。你把平常叫貨的 Excel 放進去，系統就變成你的：你的廠商、你的品項、你的參考價，以及用過去數量算出來的平常叫貨量。店裡的人之後用手機叫貨，不用再重打一份清單。
      </p>

      <ol className="mt-6 grid gap-3 md:grid-cols-3">
        {[
          ["1. 先看預覽", "在下面選檔。欄位名稱不完全一樣也會猜，CSV 用 Big5 也可以。"],
          ["2. 部署到 Render", "按下部署，用你自己的 Render 帳號開一套叫貨系統。"],
          ["3. 再傳一次同一份檔", "打開系統的「資料管理」，上傳同一份 Excel，勾選取代現有廠商。"],
        ].map(([title, body]) => (
          <li key={title} className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-6">
        <OrderPreview />
      </div>

      <section className="mt-6 rounded-3xl bg-[#1c1915] p-5 text-[#fff8f3]">
        <h2 className="text-xl font-semibold">部署成你自己的叫貨系統</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#fff8f3]/80">
          按鈕會打開 Render，並帶入叫貨系統的程式庫。Render 會問你要不要建立服務。建立完成後，用瀏覽器打開那個網址，到「推播設定＆資料管理 → 資料管理」，上傳你的叫貨表，填上店名和 Logo。
        </p>
        <a href={deployUrl} className={cn(buttonVariants(), "mt-4 inline-flex h-11 px-4")} target="_blank" rel="noreferrer">
          Deploy to Render
        </a>
        <p className="mt-3 text-xs leading-5 text-[#fff8f3]/60">檔案裡要有廠商、品項、單位、單價、數量、日期。歷史單會標成已驗收，不會推播到 LINE，也不會塞進待驗收。</p>
      </section>
    </article>
  );
}
