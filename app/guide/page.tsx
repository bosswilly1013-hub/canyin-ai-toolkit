import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "現成系統" };

export default function GuidePage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <h1 className="text-3xl font-semibold tracking-tight">系統都在這裡</h1>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">打開就能用，上傳自己的表就開始。</p>
      <p className="mt-4">
        <Link href="/systems" className="text-primary underline-offset-4 hover:underline">到現成系統</Link>
      </p>
    </article>
  );
}
