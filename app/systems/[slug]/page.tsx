import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SystemArticle } from "@/components/system-article";
import { getSystem, systems } from "@/lib/systems";

export function generateStaticParams() {
  return systems.filter((system) => system.slug !== "procurement").map((system) => ({ slug: system.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const system = getSystem(slug);
  return { title: system?.name ?? "系統", description: system?.pain };
}

export default async function SystemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const system = getSystem(slug);
  if (!system || slug === "procurement") notFound();
  return <SystemArticle system={system} />;
}
