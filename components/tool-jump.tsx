"use client";

import { useEffect } from "react";

export function ToolJump({ href, name }: { href: string; name: string }) {
  useEffect(() => {
    window.location.replace(href);
  }, [href]);
  return (
    <main style={{ padding: 28, fontFamily: "sans-serif" }}>
      <p>
        這份和文章裡是同一個工具。<a href={href}>{name}</a>
      </p>
    </main>
  );
}
