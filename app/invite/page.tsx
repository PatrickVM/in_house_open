import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/auth";
import { ArrowLeft } from "lucide-react";
import QRCodeGenerator from "@/components/invite/QRCodeGenerator";

export default async function InvitePage() {
  // Get session to check if user is authenticated
  const session = (await getServerSession(authOptions as any)) as any;

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login?callbackUrl=/invite");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with branding */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>

            <div className="flex items-center space-x-2">
              <span className="font-semibold text-foreground">
                Invite Someone New
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome header */}
        <div className="max-w-4xl mx-auto mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Share InHouse with Someone New
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            As a verified church member, you can invite trusted friends and
            family to join our community. Share your unique QR code or invite
            link below.
          </p>
        </div>

        {/* QR Code Generator Component */}
        <QRCodeGenerator />
      </div>
    </div>
  );
}
