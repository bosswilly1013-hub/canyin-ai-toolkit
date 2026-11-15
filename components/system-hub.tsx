import Link from "next/link";
import { HomeSearch } from "@/components/home-search";
import { apps } from "@/lib/apps";

export function SystemHub() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <p className="text-sm font-medium text-primary">久沃餐飲 · 給台灣餐廳</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">現成系統</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
        打開就能用。下載範例或上傳你的 Excel，系統立刻用你的資料。存在這台手機或電腦，不用註冊。
      </p>
      <div className="mt-6 max-w-xl">
        <HomeSearch />
      </div>
      <ul className="mt-8 grid gap-3 md:grid-cols-2">
        {apps.map((app) => (
          <li key={app.id}>
            <Link href={`/systems/${app.id}`} className="block h-full rounded-2xl bg-card p-4 ring-1 ring-foreground/10 hover:ring-primary/40">
              <h2 className="text-lg font-semibold">{app.name}</h2>
              <p className="mt-1 text-sm leading-6">{app.help}</p>
              <span className="mt-3 inline-flex h-11 items-center text-sm font-medium text-primary">開始使用</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-sm">
        <Link href="/tools" className="text-primary underline-offset-4 hover:underline">
          小工具：兩平、外送、毛利、走道
        </Link>
      </p>
    </div>
  );
}
