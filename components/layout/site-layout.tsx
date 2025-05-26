"use client";

import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";

interface SiteLayoutProps {
  children: React.ReactNode;
}

export function SiteLayout({ children }: SiteLayoutProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <SessionProvider>
      <div className="relative flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        {!isAdminRoute && <SiteFooter />}
      </div>
    </SessionProvider>
  );
}
