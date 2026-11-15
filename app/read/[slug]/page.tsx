import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MemberFrame } from "@/components/member/member-frame";
import { loadArticles } from "@/lib/member/load";

export function generateStaticParams() {
  return loadArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = loadArticles().find((item) => item.slug === slug);
  return { title: article?.title ?? "教材" };
}

export default async function ReadPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const articles = loadArticles();
  if (!articles.some((article) => article.slug === slug)) notFound();
  return <MemberFrame page="read" articles={articles} slug={slug} />;
}
