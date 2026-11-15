"use client";

import { useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseLooseNumber } from "@/lib/csv";

const shown = new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 4 });

function interpret(
  raw: string,
  min?: number,
  max?: number,
): { kind: "partial" } | { kind: "ok"; value: number } | { kind: "bad"; message: string } {
  const trimmed = raw.trim();
  if (trimmed === "" || trimmed === "-" || trimmed === "." || trimmed === "-." || /[.,，]$/.test(trimmed)) {
    return { kind: "partial" };
  }
  const parsed = parseLooseNumber(trimmed);
  if (parsed == null) {
    return { kind: "bad", message: "請填數字，例如 48000 或 48,000。這格不是數字，已回到上一個值。" };
  }
  if (min != null && parsed < min) {
    return {
      kind: "bad",
      message: min === 0 ? "不能填負數，已回到上一個值。" : `不能小於 ${min}，已回到上一個值。`,
    };
  }
  if (max != null && parsed > max) {
    return { kind: "bad", message: `不能大於 ${max}，已回到上一個值。` };
  }
  return { kind: "ok", value: parsed };
}

export function NumberField({
  label,
  hint,
  value,
  onChange,
  suffix,
  step = "1",
  min,
  max,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  step?: string;
  min?: number;
  max?: number;
}) {
  const id = useId();
  const messageId = `${id}-msg`;
  const [draft, setDraft] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const text = draft ?? (Number.isFinite(value) ? shown.format(value) : "");

  function apply(raw: string, revertOnBad: boolean) {
    const result = interpret(raw, min, max);
    if (result.kind === "ok") {
      setMessage("");
      onChange(result.value);
      return;
    }
    if (result.kind === "bad") {
      setMessage(result.message);
      if (revertOnBad) setDraft(null);
      return;
    }
    if (revertOnBad) {
      setDraft(null);
      if (raw.trim() === "") setMessage("空白沒有改到數字，已回到上一個值。");
    }
  }

  return (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          inputMode="decimal"
          value={text}
          step={step}
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          onFocus={() => {
            setDraft(String(value));
            setMessage("");
          }}
          onBlur={(event) => apply(event.currentTarget.value, true)}
          onValueChange={(next) => {
            setDraft(next);
            apply(next, false);
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
      {message ? (
        <p id={messageId} role="alert" className="text-xs leading-5 text-destructive">
          {message}
        </p>
      ) : null}
    </div>
  );
}
