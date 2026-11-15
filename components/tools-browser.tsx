"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { ToolCard } from "@/components/tool-card";
import { tools } from "@/lib/catalog";

export function ToolsBrowser() {
  const [query, setQuery] = useState("");
  const list = useMemo(() => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return tools.filter((tool) => {
      if (!tokens.length) return true;
      const hay = [tool.name, tool.problem, tool.answers, tool.keywords.join(" ")].join(" ").toLowerCase();
      return tokens.every((token) => hay.includes(token));
    });
  }, [query]);
  return (
    <div>
      <Input value={query} onValueChange={setQuery} placeholder="搜尋小工具，例如：外送、走道、毛利" aria-label="搜尋小工具" className="h-11 bg-card" />
      <p className="mt-3 text-sm text-muted-foreground">{list.length} 個工具</p>
      {list.length === 0 ? <p className="mt-4 rounded-2xl bg-card p-4 text-sm ring-1 ring-foreground/10">沒有對到。試「叫貨」「外送」或「走道」。</p> : null}
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {list.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </div>
  );
}
