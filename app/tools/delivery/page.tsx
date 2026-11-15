import type { Metadata } from "next";
import { ToolJump } from "@/components/tool-jump";

export const metadata: Metadata = { title: "外送定價" };

export default function Page() {
  return <ToolJump href="/downloads/delivery-calc.html" name="外送定價" />;
}
