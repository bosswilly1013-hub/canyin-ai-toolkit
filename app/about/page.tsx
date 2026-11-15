import type { Metadata } from "next";
import { MemberFrame } from "@/components/member/member-frame";
import { loadArticles } from "@/lib/member/load";

export const metadata: Metadata = { title: "認識 Willy" };

export default function AboutPage() {
  return <MemberFrame page="about" articles={loadArticles()} />;
}
