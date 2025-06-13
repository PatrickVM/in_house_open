import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { trackInviteCodeScan } from "@/lib/invite-analytics";
import RegistrationWithInvite from "@/components/invite/RegistrationWithInvite";

interface RegistrationWithCodePageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function RegistrationWithCodePage({
  params,
}: RegistrationWithCodePageProps) {
  const { code } = await params;

  // Validate and get invitation
  const inviteCode = await db.inviteCode.findUnique({
    where: { code },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          church: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!inviteCode) {
    notFound();
  }

  // Track the scan (but don't block if it fails)
  try {
    await trackInviteCodeScan(code);
  } catch (error) {
    console.error("Failed to track invite code scan:", error);
    // Continue anyway - don't block registration for analytics failure
  }

  const inviterName =
    inviteCode.user.firstName && inviteCode.user.lastName
      ? `${inviteCode.user.firstName} ${inviteCode.user.lastName}`
      : inviteCode.user.email;

  return (
    <RegistrationWithInvite
      inviteCode={code}
      inviterName={inviterName}
      inviterEmail={inviteCode.user.email}
      churchName={inviteCode.user.church?.name || null}
    />
  );
}
