"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { searchHits } from "@/lib/catalog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function SearchPanel() {
  const params = useSearchParams();
  const initial = params.get("q") ?? "";
  const [query, setQuery] = useState(initial);
  const hits = useMemo(() => searchHits(query), [query]);

  return (
    <div>
      <Input value={query} onValueChange={setQuery} placeholder="例如：外送 毛利、商圈、發票" aria-label="搜尋" className="h-11 bg-card" />
      <p className="mt-3 text-sm text-muted-foreground">{query.trim() ? `${hits.length} 筆` : "沒有打字時列出全部"}</p>
      <ul className="mt-4 space-y-3">
        {hits.length === 0 ? <li className="rounded-2xl bg-card p-4 text-sm ring-1 ring-foreground/10">沒有對到。試著改成「兩平」「外送」或「發票」。</li> : null}
        {hits.map((hit) => (
          <li key={`${hit.kind}-${hit.href}`}>
            <Link href={hit.href} className="block rounded-2xl bg-card p-4 ring-1 ring-foreground/10 hover:ring-primary/40">
              <Badge variant="secondary">{hit.kind}</Badge>
              <h2 className="mt-2 font-semibold">{hit.title}</h2>
              <p className="mt-1 line-clamp-3 text-sm leading-6 text-muted-foreground">{hit.excerpt}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
