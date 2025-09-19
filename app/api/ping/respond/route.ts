import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { PrismaClient } from '@prisma/client';
import { sendNotificationToUser } from '@/lib/firebase-admin';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { pingId, action } = await request.json();

    if (!pingId || !action) {
      return NextResponse.json(
        { error: 'Ping ID and action are required' },
        { status: 400 }
      );
    }

    if (!['ACCEPT', 'ACCEPTED', 'REJECT', 'REJECTED'].includes(action.toUpperCase())) {
      return NextResponse.json(
        { error: 'Action must be ACCEPT or REJECT' },
        { status: 400 }
      );
    }

    // Find the ping and verify the user is the receiver
    const ping = await prisma.ping.findUnique({
      where: { id: pingId },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!ping) {
      return NextResponse.json(
        { error: 'Ping not found' },
        { status: 404 }
      );
    }

    if (ping.receiverId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to respond to this ping' },
        { status: 403 }
      );
    }

    if (ping.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Ping has already been responded to' },
        { status: 400 }
      );
    }

    // Check if ping has expired
    if (new Date() > ping.expiresAt) {
      await prisma.ping.update({
        where: { id: pingId },
        data: { status: 'EXPIRED' },
      });
      
      return NextResponse.json(
        { error: 'Ping has expired' },
        { status: 400 }
      );
    }

    // Update ping status
    const newStatus = action.toUpperCase() === 'ACCEPT' || action.toUpperCase() === 'ACCEPTED' 
      ? 'ACCEPTED' 
      : 'REJECTED';

    const updatedPing = await prisma.ping.update({
      where: { id: pingId },
      data: { status: newStatus },
    });

    // Send notification to sender about the response
    const senderTokens = await prisma.fCMToken.findMany({
      where: {
        userId: ping.senderId,
        isActive: true,
      },
    });

    const receiverName = ping.receiver.firstName && ping.receiver.lastName 
      ? `${ping.receiver.firstName} ${ping.receiver.lastName}`
      : 'Someone';

    const notificationTitle = newStatus === 'ACCEPTED' 
      ? 'Ping Accepted!' 
      : 'Ping Response';
    
    const notificationBody = newStatus === 'ACCEPTED'
      ? `${receiverName} accepted your ping request`
      : `${receiverName} declined your ping request`;

    // Send notifications to all active tokens
    const notificationPromises = senderTokens.map(({ token }) =>
      sendNotificationToUser(
        token,
        {
          title: notificationTitle,
          body: notificationBody,
        },
        {
          type: 'PING_RESPONSE',
          responderId: session.user.id,
          pingId: ping.id,
          action: newStatus,
        }
      )
    );

    await Promise.allSettled(notificationPromises);

    return NextResponse.json({
      success: true,
      pingId: ping.id,
      status: newStatus,
    });
  } catch (error) {
    console.error('Error responding to ping:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}