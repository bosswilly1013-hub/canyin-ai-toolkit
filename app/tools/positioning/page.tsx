import type { Metadata } from "next";
import { ToolFrame } from "@/components/tool-frame";
import { PositioningTool } from "@/components/tools/positioning-tool";
import { getTool } from "@/lib/catalog";

const tool = getTool("positioning");
export const metadata: Metadata = { title: tool.name, description: tool.problem };

export default function Page() {
  return (
    <ToolFrame slug="positioning">
      <PositioningTool />
    </ToolFrame>
  );
}
