import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ChurchItemForm from "@/components/church/ChurchItemForm";

export default async function NewItemPage() {
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
  });

  if (!church) {
    redirect("/church/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Add New Item</h1>
        <p className="text-muted-foreground">
          Share a resource or service with your community
        </p>
      </div>

      <div className="max-w-2xl">
        <ChurchItemForm churchId={church.id} />
      </div>
    </div>
  );
}
