"use client";

import { useEffect } from "react";

const key = "lazykit.v1.seen";

export function readSeen(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function MarkSeen({ href }: { href: string }) {
  useEffect(() => {
    const current = readSeen();
    if (!current.includes(href)) localStorage.setItem(key, JSON.stringify([...current, href]));
  }, [href]);
  return null;
}
