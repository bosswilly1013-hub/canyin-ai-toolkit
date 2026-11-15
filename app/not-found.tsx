import Link from "next/link";

export default function NotFound() {
  return (
    <article className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-3xl font-semibold">這頁不在</h1>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">網址可能打錯了。回首頁或從全部工具找。</p>
      <p className="mt-4 text-sm">
        <Link href="/" className="text-primary underline-offset-4 hover:underline">回首頁</Link>
        <span className="px-2 text-muted-foreground">/</span>
        <Link href="/tools" className="text-primary underline-offset-4 hover:underline">全部工具</Link>
      </p>
    </article>
  );
}
