import type { Metadata } from "next";
import { ToolJump } from "@/components/tool-jump";

export const metadata: Metadata = { title: "店面平面圖" };

export default function Page() {
  return <ToolJump href="/downloads/floor.html" name="店面平面圖" />;
}
