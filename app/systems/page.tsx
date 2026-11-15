import type { Metadata } from "next";
import { SystemHub } from "@/components/system-hub";

export const metadata: Metadata = { title: "現成系統" };

export default function SystemsPage() {
  return <SystemHub />;
}
