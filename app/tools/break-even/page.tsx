import type { Metadata } from "next";
import { ToolJump } from "@/components/tool-jump";

export const metadata: Metadata = { title: "損益兩平" };

export default function Page() {
  return <ToolJump href="/downloads/break-even.html" name="損益兩平" />;
}