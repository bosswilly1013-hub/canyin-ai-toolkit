import type { Metadata } from "next";
import { ToolJump } from "@/components/tool-jump";

export const metadata: Metadata = { title: "每月報表" };

export default function Page() {
  return <ToolJump href="/downloads/report.html" name="每月報表" />;
}
