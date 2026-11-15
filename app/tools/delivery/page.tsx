import type { Metadata } from "next";
import { ToolFrame } from "@/components/tool-frame";
import { DeliveryTool } from "@/components/tools/delivery-tool";
import { getTool } from "@/lib/catalog";

const tool = getTool("delivery");
export const metadata: Metadata = { title: tool.name, description: tool.problem };

export default function Page() {
  return (
    <ToolFrame slug="delivery">
      <DeliveryTool />
    </ToolFrame>
  );
}
