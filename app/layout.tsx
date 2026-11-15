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
    default: "久沃訂閱",
    template: "%s · 久沃訂閱",
  },
  description: "久沃餐飲訂閱者專區。教材、歷程，和打開就能用的店務工具。",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "久沃訂閱", statusBarStyle: "black-translucent" },
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
