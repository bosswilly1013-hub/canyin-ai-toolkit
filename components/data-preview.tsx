"use client";

import { useState } from "react";
import { decodeCsvBytes, parseCsv } from "@/lib/csv";
import { downloadText, downloadXlsx } from "@/lib/download";
import { ntd } from "@/lib/format";
import type { PreviewKind, SystemSample } from "@/lib/systems";
import { Button } from "@/components/ui/button";

type Matrix = string[][];

async function readMatrix(file: File): Promise<{ matrix: Matrix; note: string }> {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".json")) {
    const text = await file.text();
    return { matrix: [[text]], note: "" };
  }
  if (lower.endsWith(".md") || lower.endsWith(".txt")) {
    const decoded = decodeCsvBytes(new Uint8Array(await file.arrayBuffer()));
    const note = decoded.encoding === "big5" ? "這個檔案是 Big5，已轉成看得到的中文。" : "";
    return { matrix: [[decoded.text]], note };
  }
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    const XLSX = await import("xlsx");
    const book = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
    const sheet = book.Sheets[book.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" }) as unknown[][];
    return { matrix: rows.map((row) => row.map((cell) => String(cell ?? ""))), note: "" };
  }
  const decoded = decodeCsvBytes(new Uint8Array(await file.arrayBuffer()));
  const note = decoded.encoding === "big5" ? "這個 CSV 是 Big5，已轉成看得到的中文。" : "";
  return { matrix: parseCsv(decoded.text), note };
}

function col(headers: string[], names: string[]) {
  return headers.findIndex((header) => names.includes(header.trim().toLowerCase()));
}

function summarize(kind: PreviewKind, matrix: Matrix): { title: string; lines: string[] } {
  if (kind === "markdown") {
    const text = matrix[0]?.[0] ?? "";
    const heads = text.split("\n").filter((line) => /^#{1,3}\s/.test(line)).map((line) => line.replace(/^#+\s/, ""));
    return { title: heads.length ? `${heads.length} 個章節` : "沒有看到標題", lines: heads };
  }
  if (kind === "workflow") {
    try {
      const data = JSON.parse(matrix[0]?.[0] ?? "") as { nodes?: { name?: string }[] };
      const names = (data.nodes ?? []).map((node) => node.name).filter(Boolean) as string[];
      return { title: names.length ? `${names.length} 個步驟` : "這份 JSON 裡沒有節點", lines: names };
    } catch {
      return { title: "這份 JSON 讀不起來", lines: [] };
    }
  }
  if (matrix.length < 2) {
    const text = matrix[0]?.[0] ?? "";
    const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
    return { title: lines.length ? `${lines.length} 行` : "檔案是空的", lines: lines.slice(0, 12) };
  }
  const headers = matrix[0];
  const body = matrix.slice(1).filter((row) => row.some((cell) => cell.trim()));
  if (kind === "products") {
    const name = col(headers, ["name", "菜名", "品項"]);
    const price = col(headers, ["regular price", "售價", "單價"]);
    return {
      title: `${body.length} 個商品`,
      lines: body.slice(0, 8).map((row) => `${row[name] || "（沒有名稱）"}　${row[price] || ""}`),
    };
  }
  if (kind === "sales") {
    const date = col(headers, ["日期", "date"]);
    const amount = col(headers, ["金額", "amount"]);
    const months = new Map<string, number>();
    for (const row of body) {
      const month = (row[date] || "").slice(0, 7);
      const value = Number(String(row[amount] ?? "").replace(/[,，]/g, ""));
      if (month && Number.isFinite(value)) months.set(month, (months.get(month) || 0) + value);
    }
    return {
      title: `${body.length} 列銷售`,
      lines: [...months.entries()].map(([month, total]) => `${month}　${ntd(total)}`),
    };
  }
  if (kind === "faq") {
    const q = col(headers, ["問題", "question"]);
    const a = col(headers, ["答案", "answer"]);
    return {
      title: `${body.length} 題`,
      lines: body.slice(0, 6).map((row) => `${row[q] || ""} → ${row[a] || ""}`),
    };
  }
  return {
    title: `${body.length} 列`,
    lines: body.slice(0, 8).map((row) => row.filter(Boolean).join("　")),
  };
}

export function DataPreview({ kind, sample }: { kind: PreviewKind; sample: SystemSample }) {
  const [fileName, setFileName] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ title: string; lines: string[] } | null>(null);

  return (
    <div className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
      <h2 className="text-lg font-semibold">先看你的資料長這樣</h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">檔案只在這台電腦整理，不會上傳。這不是把整套系統跑起來，只是讓你確認丟進去的內容。</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="inline-flex h-11 cursor-pointer items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
          選擇檔案
          <input
            className="sr-only"
            type="file"
            accept=".csv,.txt,.md,.json,.xlsx,.xls,text/csv,text/plain"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setFileName(file.name);
              setError("");
              void readMatrix(file)
                .then(({ matrix, note: encodingNote }) => {
                  setNote(encodingNote);
                  setResult(summarize(kind, matrix));
                })
                .catch(() => setError("這個檔案讀不起來。請改存成範例相同的格式。"));
            }}
          />
        </label>
        <Button
          type="button"
          variant="outline"
          className="h-11"
          onClick={() => {
            if (sample.rows) void downloadXlsx(sample.filename, [{ name: "資料", rows: sample.rows }]);
            else downloadText(sample.filename, sample.text ?? "", sample.filename.endsWith(".json") ? "application/json" : "text/plain;charset=utf-8");
          }}
        >
          下載範例
        </Button>
        {fileName ? <span className="text-sm text-muted-foreground">{fileName}</span> : null}
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{sample.note}</p>
      {note ? <p className="mt-2 text-sm text-muted-foreground">{note}</p> : null}
      {error ? <p className="mt-2 text-sm text-[#8d1d15]">{error}</p> : null}
      {result ? (
        <div className="mt-4">
          <p className="text-sm font-medium">{result.title}</p>
          <ul className="mt-2 space-y-1 text-sm leading-6">
            {result.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function SampleDownload({ sample }: { sample: SystemSample }) {
  return (
    <div className="mt-3">
      <Button
        type="button"
        variant="outline"
        className="h-11"
        onClick={() => {
          if (sample.rows) void downloadXlsx(sample.filename, [{ name: "資料", rows: sample.rows }]);
          else downloadText(sample.filename, sample.text ?? "", sample.filename.endsWith(".json") ? "application/json" : "text/plain;charset=utf-8");
        }}
      >
        下載範例
      </Button>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{sample.note}</p>
    </div>
  );
}
