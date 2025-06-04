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
  churchSelection: z.string().optional(),
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
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  zipCode: z.string().max(20).optional(),
  phone: z.string().max(20).optional(),
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
    let verificationRequested = false;

    // Check if user selected an existing church
    const isExistingChurch =
      data.churchSelection && data.churchSelection !== "other";

    if (isExistingChurch && data.churchSelection) {
      // Verify the church exists and is approved
      const church = await db.church.findUnique({
        where: {
          id: data.churchSelection,
          applicationStatus: "APPROVED",
        },
      });

      if (!church) {
        return NextResponse.json(
          { message: "Selected church not found or not approved" },
          { status: 400 }
        );
      }

      // Check if user already has a pending request for this church
      const existingRequest = await db.churchVerificationRequest.findUnique({
        where: {
          userId_churchId: {
            userId: session.user.id,
            churchId: data.churchSelection,
          },
        },
      });

      if (!existingRequest) {
        // Create verification request
        await db.churchVerificationRequest.create({
          data: {
            userId: session.user.id,
            churchId: data.churchSelection,
            requesterId: session.user.id,
            notes: "Profile form church selection",
            status: "PENDING",
          },
        });

        // Update user status
        await db.user.update({
          where: { id: session.user.id },
          data: {
            churchMembershipStatus: "REQUESTED",
            churchJoinRequestedAt: new Date(),
          },
        });

        verificationRequested = true;
      }
    }

    // Prepare update data
    const updateData: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      bio: data.bio,
      services: data.services,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      phone: data.phone,
      updatedAt: new Date(),
    };

    // Handle church information based on selection
    if (data.churchSelection === "other") {
      // Manual entry - store in churchName and churchWebsite fields
      updateData.churchName = data.churchName;
      updateData.churchWebsite = data.churchWebsite;
    } else if (isExistingChurch) {
      // Clear manual entry fields when selecting existing church
      updateData.churchName = null;
      updateData.churchWebsite = null;
    }

    // Update the user in the database
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        churchName: true,
        churchWebsite: true,
        services: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        phone: true,
        churchMembershipStatus: true,
      },
    });

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: updatedUser,
        verificationRequested,
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

export async function DELETE(req: Request) {
  try {
    // Get the current session to verify the user
    const session = (await getServerSession(authOptions as any)) as any;

    if (!session?.user) {
      return NextResponse.json(
        { message: "You must be logged in to delete your profile" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Check if user is a lead contact for any church
    const ledChurch = await db.church.findFirst({
      where: { leadContactId: userId },
    });

    if (ledChurch) {
      return NextResponse.json(
        {
          message:
            "Cannot delete account. You are the lead contact for a church. Please transfer leadership or contact support.",
        },
        { status: 400 }
      );
    }

    // Start a transaction to ensure all operations succeed or fail together
    await db.$transaction(async (tx) => {
      // 1. Unclaim any items the user has claimed (set claimerId to null)
      // await tx.item.updateMany({
      //   where: { claimerId: userId },
      //   data: {
      //     claimerId: null,
      //     status: "AVAILABLE",
      //     claimedAt: null,
      //   },
      // });

      // 2. Delete church verification requests where user is the requester
      await tx.churchVerificationRequest.deleteMany({
        where: { userId: userId },
      });

      // 3. Update verification requests where user was the verifier (set verifierId to null)
      await tx.churchVerificationRequest.updateMany({
        where: { verifierId: userId },
        data: { verifierId: null },
      });

      // 4. Handle users invited by this user (set inviterId to null)
      // await tx.user.updateMany({
      //   where: { inviterId: userId },
      //   data: { inviterId: null },
      // });

      // 5. Delete the user (this will cascade delete accounts, sessions, and inviteCode)
      await tx.user.delete({
        where: { id: userId },
      });
    });

    return NextResponse.json(
      { message: "Account deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile deletion error:", error);
    return NextResponse.json(
      { message: "An error occurred while deleting the profile" },
      { status: 500 }
    );
  }
}
