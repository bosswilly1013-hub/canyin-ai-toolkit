import type { Metadata } from "next";
import Link from "next/link";
import { resourceGroups, resources } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "懶人包導覽",
  description: "什麼時候用別人已經做好的免費工具。每一則都有驗證過的連結。",
};

export default function GuidePage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <p className="text-sm font-medium text-primary">外部好用工具</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">懶人包導覽</h1>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        這頁不重做別人的產品。每則寫一件事：什麼時候該打開它。連結都在寫這站時確認過打得開。平面圖要畫到牆和水電，請用 Sweet Home 3D；本站只檢查走道。
      </p>
      <p className="mt-3 text-sm">
        <Link href="/guides/when-to-borrow" className="text-primary underline-offset-4 hover:underline">
          什麼時候不要自己做工具
        </Link>
      </p>
      <div className="mt-8 space-y-10">
        {resourceGroups.map((group) => (
          <section key={group}>
            <h2 className="text-xl font-semibold">{group}</h2>
            <div className="mt-3 space-y-4">
              {resources
                .filter((resource) => resource.group === group)
                .map((resource) => (
                  <section key={resource.id} id={resource.id} className="scroll-mt-20 rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
                    <h3 className="font-semibold">{resource.name}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{resource.when}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm">
                      {resource.links.map((link) => (
                        <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="text-primary underline-offset-4 hover:underline">
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </section>
                ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
