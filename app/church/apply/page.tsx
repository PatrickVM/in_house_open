import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import ChurchApplicationForm from "@/components/church/ChurchApplicationForm";
import { type ChurchApplicationValues } from "@/lib/validators/church-application";
import { toast } from "sonner"; // Keep for potential client-side use if page becomes client component

// This will be moved to an API route later
async function createChurchApplicationAction(
  values: ChurchApplicationValues & { consent: boolean },
  userId: string
) {
  "use server"; // Marking as a server action for now, can be an API route
  console.log("Server Action: Church Application Values:", values);
  console.log("Server Action: Submitting User ID:", userId);

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // TODO: Replace with actual API call to /api/church/apply
  // 1. Call geocoding utility if we re-enable it, or use manually provided lat/long
  // 2. Save to database: Create a new Church record with PENDING status
  //    - name, leadPastorName, website, address, city, state, zipCode from values
  //    - leadContactId: userId
  //    - applicationStatus: PENDING
  //    - latitude, longitude (manual or from geocoding)

  // Example of potential errors or success states
  const isSuccess = Math.random() > 0.2; // Simulate success/failure

  if (!isSuccess) {
    // throw new Error("Failed to submit application. Please try again.");
    return {
      success: false,
      message: "Simulated failure: Could not submit application.",
    };
  }

  return {
    success: true,
    message:
      "Church application submitted successfully! You will be notified once it is reviewed.",
  };
}

export default async function ApplyChurchPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/church/apply");
  }

  const handleApply = async (
    values: ChurchApplicationValues & { consent: boolean }
  ) => {
    "use server";
    // Construct the full URL for server-side fetch
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const apiUrl = `${appUrl}/api/church/apply`;

    try {
      const response = await fetch(apiUrl, {
        // Use full apiUrl
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = await response.json(); // This will be returned to the client

      if (response.ok) {
        return {
          success: true,
          message: result.message || "Application submitted successfully!",
        };
      } else {
        return {
          success: false,
          message: result.message || "An unexpected error occurred.",
        };
      }
    } catch (error: any) {
      console.error(
        "Error submitting church application (Server Action):",
        error
      );
      // Avoid calling toast here. Return error details for client to handle.
      return {
        success: false,
        message:
          "Failed to submit application due to a network or server error. Please try again.",
      };
    }
  };

  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="space-y-4 mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Church Application
        </h1>
        <p className="text-lg text-muted-foreground">
          Register your church with InHouse Network to start sharing and
          receiving resources.
        </p>
      </div>

      {/* 
        To handle toast notifications based on the Server Action result,
        ChurchApplicationForm would need to call toast itself after onFormSubmit completes.
        Or, this page could be converted to a client component to manage state and toast.
        For now, the form prop type expects this return, and the form can handle it.
      */}
      <div className="bg-background border rounded-xl p-6 md:p-10 shadow-lg">
        <ChurchApplicationForm onFormSubmit={handleApply} />
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Applications are typically reviewed within 3-5 business days.</p>
      </div>
    </main>
  );
}
