import type { Metadata } from "next";
import { MemberFrame } from "@/components/member/member-frame";
import { loadArticles } from "@/lib/member/load";

export const metadata: Metadata = { title: "AI 歷程" };

export default function JourneyPage() {
  return <MemberFrame page="journey" tab="milestone" articles={loadArticles()} />;
}
