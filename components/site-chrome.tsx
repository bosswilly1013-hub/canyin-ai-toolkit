"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Search, Wrench } from "lucide-react";
import { cn } from "cn";

const desktopLinks = [
  { href: "/systems", label: "現成系統" },
  { href: "/tools", label: "小工具" },
  { href: "/search", label: "搜尋" },
];

const mobileLinks = [
  { href: "/", label: "首頁", icon: Home },
  { href: "/systems", label: "系統", icon: LayoutGrid },
  { href: "/tools", label: "小工具", icon: Wrench },
  { href: "/search", label: "搜尋", icon: Search },
];

function active(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const member = pathname === "/" || pathname.startsWith("/journey") || pathname.startsWith("/about") || pathname.startsWith("/read");
  if (member) return <>{children}</>;
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2">
        跳到內容
      </a>
      <header className="sticky top-0 z-40 border-b border-border/80 bg-[#f4efe6]/90 backdrop-blur print:hidden">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-sm text-primary-foreground">包</span>
            <span>餐飲 AI 懶人包</span>
          </Link>
          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {desktopLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm",
                  active(pathname, link.href) ? "bg-card font-medium" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
      <footer className="border-t border-border/80 px-4 py-8 pb-24 md:pb-8 print:hidden">
        <div className="mx-auto max-w-5xl text-sm leading-6 text-muted-foreground">
          <p>數字用來幫忙看店，不是會計簽證，也不是法律意見。資料留在你的裝置裡，不會上傳。</p>
        </div>
      </footer>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-[#fffdf8]/95 backdrop-blur md:hidden print:hidden">
        <div className="grid grid-cols-4 pb-[env(safe-area-inset-bottom)]">
          {mobileLinks.map((link) => {
            const Icon = link.icon;
            const on = active(pathname, link.href);
            return (
              <Link key={link.href} href={link.href} className={cn("flex flex-col items-center gap-1 py-2 text-[11px]", on ? "text-primary" : "text-muted-foreground")}>
                <Icon className="size-5" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
