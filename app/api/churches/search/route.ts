import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    // Build where clause for search
    const where = {
      applicationStatus: "APPROVED" as const,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { address: { contains: search, mode: "insensitive" as const } },
          { city: { contains: search, mode: "insensitive" as const } },
          { state: { contains: search, mode: "insensitive" as const } },
          {
            leadPastorName: { contains: search, mode: "insensitive" as const },
          },
        ],
      }),
    };

    // Get churches with member count
    const churches = await db.church.findMany({
      where,
      include: {
        leadContact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        members: {
          select: {
            id: true,
          },
        },
      },
      orderBy: [{ name: "asc" }],
      skip,
      take: limit,
    });

    const total = await db.church.count({ where });

    // Check if user has pending requests for any of these churches
    const churchIds = churches.map((church) => church.id);
    const userRequests = await db.churchVerificationRequest.findMany({
      where: {
        userId: session.user.id,
        churchId: { in: churchIds },
      },
      select: {
        churchId: true,
        status: true,
      },
    });

    const requestsMap = new Map(
      userRequests.map((req: { churchId: string; status: string }) => [
        req.churchId,
        req.status,
      ])
    );

    // Add request status and member count to each church
    const churchesWithStatus = churches.map((church) => ({
      id: church.id,
      name: church.name,
      leadPastorName: church.leadPastorName,
      website: church.website,
      address: church.address,
      city: church.city,
      state: church.state,
      zipCode: church.zipCode,
      leadContact: church.leadContact,
      memberCount: church.members.length,
      userRequestStatus: requestsMap.get(church.id) || null,
    }));

    return NextResponse.json({
      churches: churchesWithStatus,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error searching churches:", error);
    return NextResponse.json(
      { error: "Failed to search churches" },
      { status: 500 }
    );
  }
}
