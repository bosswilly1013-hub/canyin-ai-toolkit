import type { Metadata } from "next";
import { WorkApp } from "@/components/work-app";

export const metadata: Metadata = { title: "叫貨", description: "看平常叫多少，寫今天的叫貨單，複製給廠商。" };

export default function OrderSystemPage() {
  return <WorkApp id="orders" />;
}
