import Link from "next/link";
import { MarkSeen } from "@/components/mark-seen";
import { categoryName, getTool } from "@/lib/catalog";

export function ToolFrame({ slug, children }: { slug: string; children: React.ReactNode }) {
  const tool = getTool(slug);
  return (
    <article className="mx-auto w-full max-w-5xl px-4 py-6 md:py-10">
      <MarkSeen href={tool.href} />
      <p className="text-sm text-muted-foreground">
        <Link href="/" className="underline-offset-4 hover:underline">
          首頁
        </Link>
        <span className="px-1.5">/</span>
        <span>{categoryName(tool.category)}</span>
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{tool.name}</h1>
      <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">{tool.problem}</p>
      <section className="mt-5 rounded-2xl bg-[#1d3c34] px-4 py-4 text-[#f4efe6]">
        <h2 className="text-sm font-medium text-[#f4efe6]/70">這個工具幫你回答什麼</h2>
        <p className="mt-1 text-sm leading-7 md:text-base">{tool.answers}</p>
      </section>
      <div className="mt-6">{children}</div>
    </article>
  );
}
