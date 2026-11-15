import type { Metadata } from "next";
import { ToolJump } from "@/components/tool-jump";

export const metadata: Metadata = { title: "營業目標拆解" };

export default function Page() {
  return <ToolJump href="/downloads/targets.html" name="營業目標拆解" />;
}
