import Link from "next/link";
import { HomeSearch } from "@/components/home-search";
import { ToolCard } from "@/components/tool-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import { analyzeBreakEven, exampleBreakEven } from "@/lib/calc/break-even";
import { categories, resources, toolsIn } from "@/lib/catalog";
import { ntd, num } from "@/lib/format";

export default function HomePage() {
  const example = analyzeBreakEven(exampleBreakEven);
  return (
    <div>
      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:py-16">
        <div>
          <p className="text-sm font-medium text-primary">久沃餐飲 · 給台灣餐廳與小賣家</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">店裡的數字，打開就能算</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            損益兩平、外送定價、菜單毛利、營業目標、報表、品牌定位、走道夠不夠。公式寫在程式裡，不靠 AI 猜，也不用先下載檔案或註冊。
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/start" className={cn(buttonVariants(), "h-11 px-4")}>
              從新手入門開始
            </Link>
            <Link href="/tools/break-even" className={cn(buttonVariants({ variant: "outline" }), "h-11 px-4")}>
              直接算損益兩平
            </Link>
          </div>
          <div className="mt-6 max-w-xl">
            <HomeSearch />
          </div>
        </div>
        <aside className="rounded-3xl bg-[#1c1915] p-5 text-[#fff8f3]">
          <p className="text-sm text-[#fff8f3]/70">範例：社區牛肉麵店，固定成本一個月 244,000</p>
          <p className="num mt-3 text-4xl font-semibold tracking-tight">{ntd(example.base.monthlyRevenue)}</p>
          <p className="mt-2 text-sm leading-6 text-[#fff8f3]/80">
            不打折時，一個月要做到這個營業額才打平，大約每天 {num(example.base.customersPerDay, 1)} 位客人。全單打九折，同樣每天 70 人會從{" "}
            {ntd(example.base.monthlyProfitAtExpected)} 變成 {ntd(example.selected.monthlyProfitAtExpected)}。
          </p>
          <Link href="/tools/break-even" className="mt-4 inline-block text-sm underline-offset-4 hover:underline">
            用你的房租重算
          </Link>
        </aside>
      </section>

      <div className="mx-auto max-w-5xl space-y-10 px-4 pb-16">
        {categories.map((category) => {
          const list = toolsIn(category.id);
          return (
            <section key={category.id} id={category.id}>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">{category.name}</h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{category.blurb}</p>
                </div>
                <Link href={`/c/${category.id}`} className="shrink-0 text-sm text-primary underline-offset-4 hover:underline">
                  看這類
                </Link>
              </div>
              {category.id === "external" ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {["biz-district", "einvoice", "canva", "sweethome"].map((id) => resources.find((resource) => resource.id === id)!).map((resource) => (
                    <a key={resource.id} href={resource.links[0].url} target="_blank" rel="noreferrer" className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
                      <p className="text-xs text-muted-foreground">{resource.group}</p>
                      <h3 className="mt-2 font-semibold">{resource.name}</h3>
                      <p className="mt-1 line-clamp-3 text-sm leading-6 text-muted-foreground">{resource.when}</p>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {list.map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
                </div>
              )}
            </section>
          );
        })}

        <section className="grid gap-4 rounded-3xl bg-card p-5 ring-1 ring-foreground/10 md:grid-cols-3">
          <div>
            <h2 className="font-semibold">算給你看，不靠猜</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">每一個結果都是程式算出來的，旁邊寫著數字怎麼來。AI 只放在問答，而且沒有金鑰就不會出現。</p>
          </div>
          <div>
            <h2 className="font-semibold">有現成的就不重做</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">美編、地圖商家、發票、庫存系統，導覽頁連到已經存在的免費工具，並寫清楚什麼時候才需要打開。</p>
          </div>
          <div>
            <h2 className="font-semibold">數字留在這台裝置</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">輸入存在瀏覽器的 localStorage。報表在你電腦裡用 SheetJS 讀，不會上傳。</p>
          </div>
        </section>
      </div>
    </div>
  );
}
