import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { SiteChrome } from "@/components/site-chrome";
import "./globals.css";

const dm = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "餐飲 AI 懶人包",
    template: "%s · 餐飲 AI 懶人包",
  },
  description:
    "給台灣餐廳的現成系統。把自己的叫貨、菜單、班表或客人名單丟進去，變成你的系統。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hant" className={`${dm.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
