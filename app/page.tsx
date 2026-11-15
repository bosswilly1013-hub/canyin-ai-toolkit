import type { Metadata } from "next";
import { MemberFrame } from "@/components/member/member-frame";
import { loadArticles } from "@/lib/member/load";

export const metadata: Metadata = { title: "久沃訂閱" };

export default function HomePage() {
  return <MemberFrame page="home" articles={loadArticles()} />;
}
