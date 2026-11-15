import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SystemArticle } from "@/components/system-article";
import { getSystem } from "@/lib/systems";

export const metadata: Metadata = {
  title: "叫貨系統一鍵生成",
  description: "上傳自己的叫貨 Excel，變成你的廠商、品項和叫貨系統。",
};

export default function OrderSystemPage() {
  const system = getSystem("procurement");
  if (!system) notFound();
  return <SystemArticle system={system} />;
}
