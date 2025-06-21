import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import ChurchItemEditForm from "@/components/church/ChurchItemEditForm";

interface EditItemPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditItemPage({ params }: EditItemPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "CHURCH") {
    redirect("/login");
  }

  const { id } = await params;

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

  // Get the item to edit
  const item = await db.item.findFirst({
    where: {
      id,
      churchId: church.id, // Only allow editing items owned by this church
    },
  });

  if (!item) {
    notFound();
  }

  // Check if item can be edited (business rule: rejected items can't be edited)
  if (item.moderationStatus === "REJECTED") {
    redirect("/church/dashboard/items");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit Item</h1>
        <p className="text-muted-foreground">Update your item details</p>
      </div>

      <div className="max-w-2xl">
        <ChurchItemEditForm item={item} churchId={church.id} />
      </div>
    </div>
  );
}
