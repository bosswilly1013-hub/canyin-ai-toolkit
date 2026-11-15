import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { gaps, getGap } from "@/lib/systems";

export function generateStaticParams() {
  return gaps.map((gap) => ({ slug: gap.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const gap = getGap(slug);
  return { title: gap ? `${gap.name}（自製中）` : "自製中" };
}

export default async function GapPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const gap = getGap(slug);
  if (!gap) notFound();
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <p className="text-sm text-muted-foreground">
        <Link href="/systems" className="underline-offset-4 hover:underline">現成系統</Link>
      </p>
      <p className="mt-4 text-sm font-medium text-primary">自製中</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{gap.name}</h1>
      <p className="mt-3 text-base leading-7">{gap.pain}</p>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">{gap.why}</p>
    </article>
  );
}
