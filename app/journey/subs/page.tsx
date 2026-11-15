import type { Metadata } from "next";
import { MemberFrame } from "@/components/member/member-frame";
import { loadArticles } from "@/lib/member/load";

export const metadata: Metadata = { title: "訂閱成長" };

export default function SubsPage() {
  return <MemberFrame page="journey" tab="subs" articles={loadArticles()} />;
}
