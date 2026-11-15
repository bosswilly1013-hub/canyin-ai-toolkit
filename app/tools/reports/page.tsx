import type { Metadata } from "next";
import { ToolFrame } from "@/components/tool-frame";
import { ReportsTool } from "@/components/tools/reports-tool";
import { getTool } from "@/lib/catalog";

const tool = getTool("reports");
export const metadata: Metadata = { title: tool.name, description: tool.problem };

export default function Page() {
  return (
    <ToolFrame slug="reports">
      <ReportsTool />
    </ToolFrame>
  );
}
