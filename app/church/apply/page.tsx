import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import ChurchApplicationForm from "@/components/church/ChurchApplicationForm";
import {
  churchApplicationSchema,
  type ChurchApplicationValues,
} from "@/lib/validators/church-application";
// import { toast } from "sonner"; // Keep for potential client-side use if page becomes client component - NO LONGER NEEDED HERE
import { db } from "@/lib/db"; // Added for database access
import { z } from "zod"; // Added for Zod validation

// This will be moved to an API route later - REMOVED as logic is now in handleApply
// async function createChurchApplicationAction(
//   values: ChurchApplicationValues & { consent: boolean },
//   userId: string
// ) {
//   "use server"; // Marking as a server action for now, can be an API route
//   console.log("Server Action: Church Application Values:", values);
//   console.log("Server Action: Submitting User ID:", userId);
//
//   // Simulate API call
//   await new Promise((resolve) => setTimeout(resolve, 1500));
//
//   // TODO: Replace with actual API call to /api/church/apply
//   // 1. Call geocoding utility if we re-enable it, or use manually provided lat/long
//   // 2. Save to database: Create a new Church record with PENDING status
//   //    - name, leadPastorName, website, address, city, state, zipCode from values
//   //    - leadContactId: userId
//   //    - applicationStatus: PENDING
//   //    - latitude, longitude (manual or from geocoding)
//
//   // Example of potential errors or success states
//   const isSuccess = Math.random() > 0.2; // Simulate success/failure
//
//   if (!isSuccess) {
//     // throw new Error("Failed to submit application. Please try again.");
//     return {
//       success: false,
//       message: "Simulated failure: Could not submit application.",
//     };
//   }
//
//   return {
//     success: true,
//     message:
//       "Church application submitted successfully! You will be notified once it is reviewed.",
//   };
// }

export default async function ApplyChurchPage() {
  // Session check for page access - this remains the same
  const pageAccessSession = await getServerSession(authOptions);
  if (!pageAccessSession?.user?.id) {
    redirect("/login?callbackUrl=/church/apply");
  }

  const handleApply = async (
    values: ChurchApplicationValues & { consent: boolean }
  ) => {
    "use server";
    console.log("Server Action: handleApply entered with values:", values);

    try {
      const session = await getServerSession(authOptions); // Get session within the server action

      if (!session?.user?.id) {
        console.error(
          "Server Action: Unauthorized - No session or user ID found."
        );
        return {
          success: false,
          message: "Unauthorized. Please log in again.",
        };
      }

      const userId = session.user.id;
      console.log("Server Action: Authenticated User ID:", userId);

      // Check if this user already has a pending or approved church application
      // or is already a lead contact for a church.
      const existingChurchForUser = await db.church.findFirst({
        where: {
          leadContactId: userId,
          // applicationStatus: { in: ["PENDING", "APPROVED"] } // Optional: to allow re-application on REJECTED
        },
      });

      if (existingChurchForUser) {
        let message = "You are already the lead contact for a church.";
        if (existingChurchForUser.applicationStatus === "PENDING") {
          message = "You already have a pending church application.";
        }
        console.warn(
          `Server Action: User ${userId} attempt to apply with existing church: ${existingChurchForUser.id}, status: ${existingChurchForUser.applicationStatus}`
        );
        return { success: false, message }; // 409 Conflict equivalent
      }

      // Validate the incoming data
      const fullSchema = churchApplicationSchema.extend({
        consent: z.boolean().refine((val) => val === true, {
          message: "You must agree to the terms to submit an application.",
        }),
      });

      const validationResult = fullSchema.safeParse(values);

      if (!validationResult.success) {
        console.error(
          "Server Action: Validation failed",
          validationResult.error.flatten()
        );
        // Taking the first error message for simplicity, or concatenate them
        const firstErrorMessage =
          validationResult.error.errors[0]?.message || "Invalid input.";
        return { success: false, message: firstErrorMessage };
      }

      const validatedData = validationResult.data;

      // --- Manual Latitude and Longitude --- //
      // IMPORTANT: Replace these with actual, manually obtained coordinates for the church address.
      const manualLatitude = 38.440429; // Example: Santa Rosa, CA
      const manualLongitude = -122.714055; // Example: Santa Rosa, CA

      const { consent, ...churchData } = validatedData;

      const newChurchApplication = await db.church.create({
        data: {
          ...churchData,
          website: churchData.website || null,
          leadContactId: userId,
          applicationStatus: "PENDING",
          latitude: manualLatitude,
          longitude: manualLongitude,
        },
      });
      console.log(
        `Server Action: Church application created successfully for user ${userId}, church ID: ${newChurchApplication.id}`
      );
      return {
        success: true,
        message: "Church application submitted successfully!",
        // churchId: newChurchApplication.id, // Optionally return new church ID
      };
    } catch (error: any) {
      console.error(
        "Error submitting church application (Server Action):",
        error
      );
      if (error instanceof z.ZodError) {
        // Should be caught by safeParse, but as a fallback
        return {
          success: false,
          message:
            "Validation error: " +
            error.errors.map((e) => e.message).join(", "),
        };
      }
      return {
        success: false,
        message:
          "Failed to submit application due to an unexpected server error. Please try again.",
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
