import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(1),
  leadPastorName: z.string().min(1),
  website: z.string().url().optional().or(z.literal("")),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "CHURCH") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // Get the church associated with this user
    const church = await db.church.findFirst({
      where: {
        leadContactId: session.user.id,
        applicationStatus: "APPROVED",
      },
    });

    if (!church) {
      return NextResponse.json(
        { message: "Church not found" },
        { status: 404 }
      );
    }

    // Update the church profile
    const updatedChurch = await db.church.update({
      where: { id: church.id },
      data: {
        name: validatedData.name,
        leadPastorName: validatedData.leadPastorName,
        website: validatedData.website || null,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        zipCode: validatedData.zipCode,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ church: updatedChurch });
  } catch (error) {
    console.error("Error updating church profile:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
