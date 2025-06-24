import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import {
  churchApplicationSchema,
  type ChurchApplicationValues,
} from "@/lib/validators/church-application";
import { z } from "zod";
import { ActivityLogService } from "@/lib/activity-logs/service";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.error(
        "API Route: Unauthorized - No session or user ID found.",
        JSON.stringify(session, null, 2)
      );
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if this user already has a pending or approved church application
    // or is already a lead contact for a church.
    const existingChurchForUser = await db.church.findFirst({
      where: {
        leadContactId: userId,
        // Optionally, filter by applicationStatus if you want to allow re-application on REJECTED
        // applicationStatus: { in: ["PENDING", "APPROVED"] }
      },
    });

    if (existingChurchForUser) {
      let message = "You are already the lead contact for a church.";
      if (existingChurchForUser.applicationStatus === "PENDING") {
        message = "You already have a pending church application.";
      }
      return NextResponse.json({ message }, { status: 409 }); // 409 Conflict
    }

    const body = await req.json();

    const fullSchema = churchApplicationSchema.extend({
      consent: z.boolean().refine((val) => val === true, {
        message: "You must agree to the terms to submit an application.",
      }),
    });

    const validatedData = fullSchema.parse(body);

    // --- Manual Latitude and Longitude --- //
    // IMPORTANT: Replace these with actual, manually obtained coordinates for the church address.
    // These are placeholders. In a real scenario, you would look up these values based on validatedData.address, etc.
    const manualLatitude = 38.440429; // Example: Santa Rosa, CA
    const manualLongitude = -122.714055; // Example: Santa Rosa, CA
    // You might want to add a check here to ensure these are valid numbers before saving.

    const { consent, ...churchData } = validatedData;

    const newChurchApplication = await db.church.create({
      data: {
        ...churchData,
        website: churchData.website || null, // Ensure empty string becomes null if schema allows
        leadContactId: userId,
        applicationStatus: "PENDING", // Default, but explicit
        latitude: manualLatitude, // Using manually set latitude
        longitude: manualLongitude, // Using manually set longitude
      },
    });

    // Log church application submitted to ActivityLog
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true, email: true },
      });

      if (user) {
        const userName =
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.email;

        await ActivityLogService.logChurchApplicationSubmitted(
          userId,
          userName,
          user.email,
          churchData.name,
          newChurchApplication.id
        );
      }
    } catch (error) {
      console.error("Failed to log church application submitted:", error);
      // Don't fail application if activity logging fails
    }

    return NextResponse.json(
      {
        message: "Church application submitted successfully!",
        churchApplication: newChurchApplication,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors }, { status: 400 });
    }
    console.error("Error creating church application:", error);
    return NextResponse.json(
      { message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
