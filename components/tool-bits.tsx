import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Stat({
  label,
  value,
  hint,
  tone = "ink",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "ink" | "paper";
}) {
  const dark = tone === "ink";
  return (
    <div className={dark ? "rounded-2xl bg-[#1c1915] p-4 text-[#fff8f3]" : "rounded-2xl bg-card p-4 ring-1 ring-foreground/10"}>
      <div className={dark ? "text-xs text-[#fff8f3]/70" : "text-xs text-muted-foreground"}>{label}</div>
      <div className="num mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{value}</div>
      {hint ? <div className={dark ? "mt-1 text-xs leading-5 text-[#fff8f3]/70" : "mt-1 text-xs leading-5 text-muted-foreground"}>{hint}</div> : null}
    </div>
  );
}

export function Callout({
  tone = "warn",
  children,
}: {
  tone?: "warn" | "bad" | "good";
  children: ReactNode;
}) {
  const styles = {
    warn: "border-[#e4c98a] bg-[#fff6df] text-[#6d4e09]",
    bad: "border-[#f0b4ae] bg-[#fff1ef] text-[#8d1d15]",
    good: "border-[#b7d7c4] bg-[#eef7f1] text-[#1d5c3a]",
  }[tone];
  return <div className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${styles}`}>{children}</div>;
}

export function Explain({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-2 space-y-2 text-sm leading-7 text-muted-foreground">{children}</div>
    </section>
  );
}

export function StorageNote({
  fromStorage,
  onReset,
}: {
  fromStorage: boolean;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span>數字存在這台裝置的瀏覽器，不會上傳。</span>
      {fromStorage ? <Badge variant="secondary">已讀取上次輸入</Badge> : <Badge variant="outline">目前是範例</Badge>}
      <Button type="button" variant="outline" size="sm" className="h-8" onClick={onReset}>
        恢復範例
      </Button>
    </div>
  );
}
