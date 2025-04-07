import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteLayout } from "@/components/layout/site-layout";

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
          <SiteLayout>{children}</SiteLayout>
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
