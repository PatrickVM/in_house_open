"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { HomeIcon, AlertCircle } from "lucide-react";
// import { WalkthroughHelpButton } from "@/lib/walkthrough/components/WalkthroughHelpButton";
import { ReportModal } from "./report-modal";

export function SiteFooter() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <div className="flex items-center gap-2 ml-4">
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
          {session && (
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="text-sm text-muted-foreground hover:underline underline-offset-4 flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              Report
            </button>
          )}
          {/* <WalkthroughHelpButton /> */}
        </div>
      </div>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </footer>
  );
}
