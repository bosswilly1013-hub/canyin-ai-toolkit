"use client";

import { useState } from "react";
import Link from "next/link";
import { AI_SYSTEM_PROMPT, readAiConfig } from "@/lib/ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Callout } from "@/components/tool-bits";

type Message = { role: "user" | "assistant"; content: string };

export function AskPanel() {
  const config = readAiConfig();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!config.enabled) {
    return (
      <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
        <h2 className="font-semibold">問答還沒接上</h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          站長若在建置時設定了 API 金鑰，這裡才會出現對話框。沒有金鑰不影響其他工具。損益、定價、毛利、來客數都用工具算，不靠對話。
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          <li><Link className="text-primary underline-offset-4 hover:underline" href="/tools/break-even">損益兩平</Link></li>
          <li><Link className="text-primary underline-offset-4 hover:underline" href="/tools/delivery">外送定價</Link></li>
          <li><Link className="text-primary underline-offset-4 hover:underline" href="/systems">現成系統</Link></li>
        </ul>
      </div>
    );
  }

  async function send() {
    const content = draft.trim();
    if (!content || busy) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setDraft("");
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: "system", content: AI_SYSTEM_PROMPT }, ...next],
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
      const answer = data.choices?.[0]?.message?.content?.trim();
      if (!answer) throw new Error("空回覆");
      setMessages([...next, { role: "assistant", content: answer }]);
    } catch {
      setError("這次回覆沒有成功。請稍後再試，數字題請改開對應的工具。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {messages.length === 0 ? <li className="text-sm text-muted-foreground">可以直接問「外送價該先看哪一頁」。算式請不要請它代算。</li> : null}
        {messages.map((message, index) => (
          <li key={`${message.role}-${index}`} className={message.role === "user" ? "ml-8 rounded-2xl bg-secondary px-4 py-3 text-sm leading-6" : "mr-8 rounded-2xl bg-card px-4 py-3 text-sm leading-6 ring-1 ring-foreground/10"}>
            {message.content}
          </li>
        ))}
      </ul>
      {error ? <Callout tone="bad">{error}</Callout> : null}
      <Textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="用台灣的講法問經營問題" className="min-h-24" />
      <Button type="button" className="h-11 px-4" disabled={busy || draft.trim() === ""} onClick={() => void send()}>
        {busy ? "送出中" : "送出"}
      </Button>
    </div>
  );
}
