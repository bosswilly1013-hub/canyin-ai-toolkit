import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolCard } from "@/components/tool-card";
import { categories, resources, toolsIn, type CategoryId } from "@/lib/catalog";

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
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {resources.map((resource) => (
            <a key={resource.id} href={`/guide#${resource.id}`} className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
              <p className="text-xs text-muted-foreground">{resource.group}</p>
              <h2 className="mt-2 font-semibold">{resource.name}</h2>
              <p className="mt-1 line-clamp-3 text-sm leading-6 text-muted-foreground">{resource.when}</p>
            </a>
          ))}
        </div>
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
