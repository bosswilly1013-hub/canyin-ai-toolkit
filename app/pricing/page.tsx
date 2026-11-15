import type { Metadata } from "next";
import { getMembership } from "@/lib/membership";

export const metadata: Metadata = {
  title: "方案",
  description: "目前全部免費。之後若加會員，會用 Supabase 登入、綠界收款。",
};

export default function PricingPage() {
  const membership = getMembership();
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <p className="text-sm font-medium text-primary">方案預告</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">現在不用付錢，也沒有登入</h1>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        這一版所有工具都開著。狀態是「{membership.signedIn ? "已登入" : "未登入"}／{membership.tier === "free" ? "免費" : "會員"}」。這頁不能結帳。
      </p>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <section className="rounded-2xl bg-[#1c1915] p-5 text-[#fff8f3]">
          <h2 className="text-lg font-semibold">現在</h2>
          <p className="mt-2 text-sm leading-7 text-[#fff8f3]/80">損益、定價、菜單、目標、報表、定位圖、平面圖、導覽、搜尋，全部免費用。資料留在你的瀏覽器。</p>
        </section>
        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
          <h2 className="text-lg font-semibold">之後如果要加會員</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            登入會用 Supabase，收款會用綠界 ECPay 定期定額。付費前核心試算仍會留著。價格還沒有，也不會在這頁先收。
          </p>
        </section>
      </div>
      <p className="mt-6 text-xs leading-6 text-muted-foreground">
        工程備註：金流回呼需要伺服器。現在的靜態輸出收不到綠界通知，真的要收費時得拿掉靜態輸出，或把回呼放到另一個服務，並且只相信伺服器寫入的會員狀態。
      </p>
    </article>
  );
}
