import type { Metadata } from "next";
import { ToolJump } from "@/components/tool-jump";

export const metadata: Metadata = { title: "品牌定位圖" };

export default function Page() {
  return <ToolJump href="/downloads/position.html" name="品牌定位圖" />;
}
