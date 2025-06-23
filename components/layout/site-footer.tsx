import Link from "next/link";
import { HomeIcon } from "lucide-react";
import { WalkthroughHelpButton } from "@/lib/walkthrough/components/WalkthroughHelpButton";

export function SiteFooter() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <div className="flex items-center gap-2">
          <HomeIcon className="h-5 w-5" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} In-House. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/directory"
            className="text-sm text-muted-foreground hover:underline underline-offset-4"
          >
            Directory
          </Link>
          <WalkthroughHelpButton />
        </div>
      </div>
    </footer>
  );
}
