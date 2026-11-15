import type { Metadata } from "next";
import { ToolFrame } from "@/components/tool-frame";
import { BreakEvenTool } from "@/components/tools/break-even-tool";
import { getTool } from "@/lib/catalog";

const tool = getTool("break-even");
export const metadata: Metadata = { title: tool.name, description: tool.problem };

export default function Page() {
  return (
    <ToolFrame slug="break-even">
      <BreakEvenTool />
    </ToolFrame>
  );
}
