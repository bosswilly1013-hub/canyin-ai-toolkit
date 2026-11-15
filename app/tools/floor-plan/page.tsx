import type { Metadata } from "next";
import { ToolFrame } from "@/components/tool-frame";
import { FloorTool } from "@/components/tools/floor-tool";
import { getTool } from "@/lib/catalog";

const tool = getTool("floor-plan");
export const metadata: Metadata = { title: tool.name, description: tool.problem };

export default function Page() {
  return (
    <ToolFrame slug="floor-plan">
      <FloorTool />
    </ToolFrame>
  );
}
