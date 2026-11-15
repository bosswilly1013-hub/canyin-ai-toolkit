import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "現成系統",
  description: "每一類一套可以把自己的資料丟進去的系統。",
};

export default function GuidePage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <h1 className="text-3xl font-semibold tracking-tight">改看現成系統</h1>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        以前這裡是一串外部連結。現在每一類只留一套能用的系統，放在現成系統。
      </p>
      <p className="mt-4">
        <Link href="/systems" className="text-primary underline-offset-4 hover:underline">
          到現成系統
        </Link>
      </p>
    </article>
  );
}
