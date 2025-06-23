import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { SiteLayout } from "@/components/layout/site-layout";
import { Toaster } from "@/components/ui/sonner";
import { WalkthroughProvider } from "@/lib/walkthrough/WalkthroughProvider";

export const metadata: Metadata = {
  title: "In-House - Community Directory",
  description: "A community directory for connecting local services and skills",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SiteLayout>
            <WalkthroughProvider>{children}</WalkthroughProvider>
          </SiteLayout>
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
