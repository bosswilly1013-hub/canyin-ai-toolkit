import Link from "next/link";
import { HomeSearch } from "@/components/home-search";
import { difficultyLabel, gaps, systems } from "@/lib/systems";

export function SystemHub() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <p className="text-sm font-medium text-primary">久沃餐飲 · 給台灣餐廳與小店</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">現成系統</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
        不是教學卡。每一類只留一套最能用的。你把自己的菜單、叫貨、班表或客人名單丟進去，它就變成你的系統。算房租、毛利的小工具還在，放在後面。這個網站是靜態頁，放在 Firebase Hosting。
      </p>
      <div className="mt-6 max-w-xl">
        <HomeSearch />
      </div>
      <ul className="mt-8 grid gap-3 md:grid-cols-2">
        {systems.map((system) => (
          <li key={system.slug}>
            <Link href={system.slug === "procurement" ? "/order-system" : `/systems/${system.slug}`} className="block h-full rounded-2xl bg-card p-4 ring-1 ring-foreground/10 hover:ring-primary/40">
              <p className="text-xs text-muted-foreground">{system.category}</p>
              <h2 className="mt-2 text-lg font-semibold">{system.name}</h2>
              <p className="mt-1 text-sm leading-6">{system.pain}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">丟進去：{system.dataIn}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {system.setupTime} · {difficultyLabel[system.difficulty]} · {system.cost}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <section className="mt-10">
        <h2 className="text-2xl font-semibold">自製中</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">這三塊沒有夠好的現成倉庫。不編連結。</p>
        <ul className="mt-4 grid gap-3 md:grid-cols-3">
          {gaps.map((gap) => (
            <li key={gap.slug}>
              <Link href={`/building/${gap.slug}`} className="block h-full rounded-2xl border border-dashed border-foreground/20 p-4">
                <p className="text-xs text-muted-foreground">自製中</p>
                <h3 className="mt-2 font-semibold">{gap.name}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{gap.pain}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <p className="mt-10 text-sm">
        <Link href="/tools" className="text-primary underline-offset-4 hover:underline">
          小工具：兩平、外送、菜單毛利、走道
        </Link>
      </p>
    </div>
  );
}
