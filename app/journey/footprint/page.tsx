import type { Metadata } from "next";
import { MemberFrame } from "@/components/member/member-frame";
import { loadArticles } from "@/lib/member/load";

export const metadata: Metadata = { title: "數位足跡" };

export default function FootprintPage() {
  return <MemberFrame page="journey" tab="footprint" articles={loadArticles()} />;
}
