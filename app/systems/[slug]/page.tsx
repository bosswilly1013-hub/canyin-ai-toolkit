import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorkApp } from "@/components/work-app";
import { apps, getApp, type AppId } from "@/lib/apps";

export function generateStaticParams() {
  return apps.map((app) => ({ slug: app.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const app = getApp(slug);
  return { title: app?.name ?? "系統", description: app?.help };
}

export default async function SystemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const app = getApp(slug);
  if (!app) notFound();
  return <WorkApp id={app.id as AppId} />;
}
