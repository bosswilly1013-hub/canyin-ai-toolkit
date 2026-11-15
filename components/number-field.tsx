"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NumberField({
  label,
  hint,
  value,
  onChange,
  suffix,
  step = "1",
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  step?: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const text = draft ?? String(value);

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="relative">
        <Input
          inputMode="decimal"
          value={text}
          step={step}
          onFocus={(event) => {
            setDraft(String(value));
            event.currentTarget.select();
          }}
          onBlur={() => setDraft(null)}
          onValueChange={(next) => {
            setDraft(next);
            const parsed = Number(next);
            if (next.trim() !== "" && Number.isFinite(parsed)) onChange(parsed);
          }}
          className="num pr-14"
        />
        {suffix ? (
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </div>
      {hint ? <p className="text-xs leading-5 text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
