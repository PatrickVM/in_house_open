"use client";

import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { SessionProvider } from "next-auth/react";

interface SiteLayoutProps {
  children: React.ReactNode;
}

export function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <SessionProvider>
      <div className="relative flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </SessionProvider>
  );
}
