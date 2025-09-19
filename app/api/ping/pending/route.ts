import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get pending pings received by the current user with sender details
    const pendingPings = await prisma.ping.findMany({
      where: {
        receiverId: session.user.id,
        status: 'PENDING',
        expiresAt: {
          gt: new Date(), // Not expired
        },
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format the response
    const formattedPings = pendingPings.map(ping => ({
      id: ping.id,
      senderId: ping.senderId,
      senderName: ping.sender.firstName && ping.sender.lastName 
        ? `${ping.sender.firstName} ${ping.sender.lastName}`
        : ping.sender.email,
      createdAt: ping.createdAt.toISOString(),
      expiresAt: ping.expiresAt.toISOString(),
      message: ping.message,
    }));

    return NextResponse.json({
      pings: formattedPings,
      count: formattedPings.length,
    });
  } catch (error) {
    console.error('Error getting pending pings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}