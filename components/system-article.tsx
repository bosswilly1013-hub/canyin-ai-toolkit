import Link from "next/link";
import { OrderPreview } from "@/components/order-preview";
import { DataPreview, SampleDownload } from "@/components/data-preview";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import { difficultyLabel, freeTierNote, type ReadySystem } from "@/lib/systems";

export function SystemArticle({ system }: { system: ReadySystem }) {
  return (
    <article className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <p className="text-sm text-muted-foreground">
        <Link href="/systems" className="underline-offset-4 hover:underline">現成系統</Link>
        <span className="px-1.5">/</span>
        {system.category}
      </p>
      <p className="mt-4 text-sm font-medium text-primary">{system.category}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{system.name}</h1>
      <p className="mt-3 max-w-2xl text-base leading-7">{system.pain}</p>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{system.example}</p>
      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        {[
          ["丟什麼進去", system.dataIn],
          ["多久可以試", system.setupTime],
          ["要花什麼", system.cost],
          ["難度", difficultyLabel[system.difficulty]],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-sm leading-6">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">你的資料</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">介面：{system.chinese}</p>
        {system.preview === "orders" ? (
          <div className="mt-4">
            <OrderPreview />
          </div>
        ) : system.preview ? (
          <div className="mt-4">
            <DataPreview kind={system.preview} sample={system.sample} />
          </div>
        ) : (
          <SampleDownload sample={system.sample} />
        )}
      </section>

      <section className="mt-8 rounded-3xl bg-[#1c1915] p-5 text-[#fff8f3]">
        <h2 className="text-xl font-semibold">放到 Google Cloud</h2>
        <p className="mt-2 text-sm leading-7 text-[#fff8f3]/80">{freeTierNote}</p>
        {system.cloudRunUrl ? (
          <a href={system.cloudRunUrl} className={cn(buttonVariants(), "mt-4 inline-flex h-11 px-4")} target="_blank" rel="noreferrer">
            放到 Google Cloud（Run on Google Cloud）
          </a>
        ) : (
          <p className="mt-4 text-sm leading-7">這套沒有可以一鍵建置的 Dockerfile，所以沒有 Cloud Run 按鈕。</p>
        )}
        {system.cloudRunNote ? <p className="mt-3 text-sm leading-7 text-[#fff8f3]/80">{system.cloudRunNote}</p> : null}
        {system.secondary?.map((item) => (
          <div key={item.url} className="mt-4">
            <a href={item.url} className="text-sm underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
              {item.label}
            </a>
            <p className="mt-1 text-xs leading-5 text-[#fff8f3]/70">{item.note}</p>
          </div>
        ))}
        {system.docsUrl ? (
          <p className="mt-4 text-sm">
            <a href={system.docsUrl.url} className="underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
              {system.docsUrl.label}
            </a>
          </p>
        ) : null}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">從零到能用</h2>
        <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm leading-7">
          {system.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      {system.companion ? <p className="mt-6 rounded-2xl bg-card p-4 text-sm leading-7 ring-1 ring-foreground/10">{system.companion}</p> : null}

      <section className="mt-8 text-sm leading-7">
        <h2 className="text-xl font-semibold">授權</h2>
        <p className="mt-2 text-muted-foreground">{system.license}</p>
        <p className="mt-3">
          <a href={system.repoUrl} className="text-primary underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
            倉庫
          </a>
          {system.repoPrivate ? "。這是私有倉庫，沒登入 GitHub 會看到找不到。部署時要用有權限的帳號。" : null}
        </p>
      </section>
    </article>
  );
}
