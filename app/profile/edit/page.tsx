import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ProfileForm from "@/components/profile/ProfileForm";

export default async function EditProfilePage() {
  // Get session to check if user is authenticated
  const session = (await getServerSession(authOptions as any)) as any;

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login?callbackUrl=/profile/edit");
  }

  // Get full user data from database
  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/profile");
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Edit Your Profile</h1>
      <p className="text-muted-foreground mb-8">
        Complete your profile to appear in the directory and connect with
        others.
      </p>

      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <ProfileForm user={user} />
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-800">
          Why complete your profile?
        </h3>
        <ul className="list-disc list-inside mt-2 text-sm text-blue-700 space-y-1">
          <li>Connect with others in the community</li>
          <li>Share your skills and services</li>
          <li>Find people with services you need</li>
          <li>Build relationships within your local area</li>
        </ul>
      </div>
    </main>
  );
}
