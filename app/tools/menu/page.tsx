import type { Metadata } from "next";
import { ToolFrame } from "@/components/tool-frame";
import { MenuTool } from "@/components/tools/menu-tool";
import { getTool } from "@/lib/catalog";

const tool = getTool("menu");
export const metadata: Metadata = { title: tool.name, description: tool.problem };

export default function Page() {
  return (
    <ToolFrame slug="menu">
      <MenuTool />
    </ToolFrame>
  );
}
