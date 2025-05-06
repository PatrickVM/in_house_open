import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Validation schema for profile updates
const profileUpdateSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50)
    .optional(),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50)
    .optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  churchName: z.string().max(100).optional(),
  churchWebsite: z
    .string()
    .url("Please enter a valid URL")
    .max(100)
    .optional()
    .or(z.literal("")),
  services: z
    .string()
    .max(200, "Services must be less than 200 characters")
    .optional(),
});

export async function PUT(req: Request) {
  try {
    // Get the current session to verify the user
    const session = (await getServerSession(authOptions as any)) as any;

    if (!session?.user) {
      return NextResponse.json(
        { message: "You must be logged in to update your profile" },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await req.json();

    // Validate the data
    const result = profileUpdateSchema.safeParse(body);
    if (!result.success) {
      const { errors } = result.error;
      return NextResponse.json(
        { message: "Invalid input data", errors },
        { status: 400 }
      );
    }

    // Get validated data
    const data = result.data;

    // Update the user in the database
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio,
        churchName: data.churchName,
        churchWebsite: data.churchWebsite,
        services: data.services,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        churchName: true,
        churchWebsite: true,
        services: true,
      },
    });

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { message: "An error occurred while updating the profile" },
      { status: 500 }
    );
  }
}
