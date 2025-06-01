import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ChurchProfileForm from "@/components/church/ChurchProfileForm";

export default async function ChurchProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "CHURCH") {
    redirect("/login");
  }

  // Get the church associated with this user
  const church = await db.church.findFirst({
    where: {
      leadContactId: session.user.id,
      applicationStatus: "APPROVED",
    },
    include: {
      leadContact: true,
    },
  });

  if (!church) {
    redirect("/church/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Church Profile</h1>
        <p className="text-muted-foreground">
          Manage your church information and contact details
        </p>
      </div>

      <div className="max-w-4xl">
        <ChurchProfileForm church={church} />
      </div>
    </div>
  );
}
