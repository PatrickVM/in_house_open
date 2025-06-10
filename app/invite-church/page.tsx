import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { authOptions } from "@/auth";
import { ArrowLeft } from "lucide-react";
import ChurchInvitationForm from "@/components/church/ChurchInvitationForm";

export default async function InviteChurchPage() {
  // Get session to check if user is authenticated
  const session = (await getServerSession(authOptions as any)) as any;

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login?callbackUrl=/invite-church");
  }

  // Get full user data from database
  const user = await db.user.findUnique({
    where: { id: session.user.id as string },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Create display name
  const userName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email;

  return (
    <div className="container flex flex-col items-center justify-center py-10 md:py-20">
      <div className="w-full max-w-2xl">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            href="/profile"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            Invite a Church to InHouse
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Help grow our community by inviting churches to join InHouse and
            connect with their members.
          </p>
        </div>

        {/* Form */}
        <ChurchInvitationForm
          userEmail={user.email}
          userName={userName}
          userPhone={user.phone || undefined}
        />
      </div>
    </div>
  );
}
