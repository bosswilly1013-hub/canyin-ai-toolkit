import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { categoryName, type ToolInfo } from "@/lib/catalog";

export function ToolCard({ tool }: { tool: ToolInfo }) {
  return (
    <Link
      href={tool.href}
      className="group flex h-full flex-col rounded-2xl bg-card p-4 ring-1 ring-foreground/10 transition hover:-translate-y-0.5 hover:ring-primary/50"
    >
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{categoryName(tool.category)}</span>
        <ArrowUpRight className="size-4 transition group-hover:text-primary" />
      </div>
      <h3 className="mt-3 text-lg font-semibold tracking-tight">{tool.name}</h3>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{tool.problem}</p>
    </Link>
  );
}
