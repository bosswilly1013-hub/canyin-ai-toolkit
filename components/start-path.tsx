"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { readSeen } from "@/components/mark-seen";
import { startSteps } from "@/lib/catalog";

export function StartPath() {
  const seen = useSyncExternalStore(
    () => () => {},
    () => readSeen().join("\n"),
    () => "",
  ).split("\n").filter(Boolean);
  const done = startSteps.filter((step) => seen.includes(step.href)).length;

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        已看過 {done} / {startSteps.length}。打開工具頁就會記在這台裝置。
      </p>
      <ol className="mt-4 space-y-3">
        {startSteps.map((step, index) => {
          const checked = seen.includes(step.href);
          return (
            <li key={step.href} className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
              <div className="flex items-start gap-3">
                <span className={`grid size-8 shrink-0 place-items-center rounded-full text-sm ${checked ? "bg-[#1d3c34] text-white" : "bg-secondary"}`}>
                  {index + 1}
                </span>
                <div>
                  <h2 className="font-semibold">
                    <Link href={step.href} className="underline-offset-4 hover:underline">
                      {step.title}
                    </Link>
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.detail}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{checked ? "看過了" : "還沒打開"}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
