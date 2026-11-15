import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuide, guides } from "@/lib/catalog";

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  return { title: guide?.title ?? "文章", description: guide?.summary };
}

export default async function GuideArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <p className="text-sm text-muted-foreground">
        <Link href="/guide" className="underline-offset-4 hover:underline">懶人包導覽</Link>
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{guide.title}</h1>
      <p className="mt-3 text-base leading-7 text-muted-foreground">{guide.summary}</p>
      <div className="mt-6 space-y-4 text-sm leading-7">
        {guide.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
