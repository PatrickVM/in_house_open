import { Suspense } from "react";
import ItemForm from "@/components/items/ItemForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

export default async function NewItemPage() {
  // Get session to check if user is authenticated
  const session = await getServerSession(authOptions);

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login?callbackUrl=/items/new");
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">List a New Item</h1>
      <p className="text-muted-foreground mb-8">
        Share items with other churches and community members.
      </p>

      <Suspense
        fallback={
          <div className="h-[400px] w-full bg-gray-100 animate-pulse" />
        }
      >
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <ItemForm onSuccess={() => {}} />
        </div>
      </Suspense>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-800">
          Guidelines for Listing Items
        </h3>
        <ul className="list-disc list-inside mt-2 text-sm text-blue-700 space-y-1">
          <li>Provide clear, detailed descriptions of items</li>
          <li>Be honest about condition and any defects</li>
          <li>Include accurate location information</li>
          <li>Items should be in usable condition</li>
          <li>Respond promptly to inquiries</li>
        </ul>
      </div>
    </main>
  );
}
