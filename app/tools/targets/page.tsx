import type { Metadata } from "next";
import { ToolFrame } from "@/components/tool-frame";
import { TargetsTool } from "@/components/tools/targets-tool";
import { getTool } from "@/lib/catalog";

const tool = getTool("targets");
export const metadata: Metadata = { title: tool.name, description: tool.problem };

export default function Page() {
  return (
    <ToolFrame slug="targets">
      <TargetsTool />
    </ToolFrame>
  );
}
