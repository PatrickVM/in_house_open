import { SiteLayout } from "@/components/layout/site-layout";
import { Toaster } from "@/components/ui/sonner";
import { WalkthroughProvider } from "@/lib/walkthrough/WalkthroughProvider";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "In-House - Connect His Church",
  description:
    "Intentionally connecting internally to creatively connect outwardly.",
  keywords: ["church", "community", "connection", "in-house", "faith"],
  authors: [{ name: "In-House Team" }],
  creator: "In-House",
  publisher: "In-House",

  // Favicon and icons using HomeIcon design
  icons: {
    icon: [
      { url: "/homeicon.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" }, // Fallback for browsers
    ],
    shortcut: "/homeicon.png",
    apple: [{ url: "/homeicon.png", sizes: "192x192", type: "image/png" }],
  },

  // Open Graph for social media sharing
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://in-house.tech",
    siteName: "In-House",
    title: "In-House - Connect His Church",
    description:
      "Intentionally connecting internally to creatively connect outwardly.",
    images: [
      {
        url: "/homeicon.png",
        width: 192,
        height: 192,
        alt: "In-House - Connect His Church",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "In-House - Connect His Church",
    description:
      "Intentionally connecting internally to creatively connect outwardly.",
    images: ["/homeicon.png"],
    creator: "@cyams34",
  },

  // Additional meta tags
  metadataBase: new URL("https://in-house.tech"),
  alternates: {
    canonical: "/",
  },
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
