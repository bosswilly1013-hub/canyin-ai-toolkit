import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolCard } from "@/components/tool-card";
import { categories, toolsIn, type CategoryId } from "@/lib/catalog";

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = categories.find((item) => item.id === slug);
  return { title: category?.name ?? "分類" };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categories.find((item) => item.id === slug);
  if (!category) notFound();
  const list = toolsIn(category.id as CategoryId);
  return (
    <article className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <p className="text-sm text-muted-foreground">
        <Link href="/" className="underline-offset-4 hover:underline">首頁</Link>
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{category.name}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">{category.blurb}</p>
      {category.id === "external" ? (
        <p className="mt-6 text-sm leading-7">
          外部連結清單已拿掉。每一類現在只留一套系統。
          <Link href="/systems" className="ml-1 text-primary underline-offset-4 hover:underline">看現成系統</Link>
        </p>
      ) : (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {list.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      )}
    </article>
  );
}
