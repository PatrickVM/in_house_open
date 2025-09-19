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

    const url = new URL(request.url);
    const targetUserId = url.searchParams.get('targetUserId');

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Target user ID is required' },
        { status: 400 }
      );
    }

    // Check for ping between current user and target user (both directions)
    const [sentPing, receivedPing] = await Promise.all([
      prisma.ping.findUnique({
        where: {
          senderId_receiverId: {
            senderId: session.user.id,
            receiverId: targetUserId,
          },
        },
      }),
      prisma.ping.findUnique({
        where: {
          senderId_receiverId: {
            senderId: targetUserId,
            receiverId: session.user.id,
          },
        },
      }),
    ]);

    // Determine the relevant ping and relationship status
    let pingStatus = null;
    let canSendPing = true;
    let canViewContact = false;
    let relationshipStatus = 'none'; // none, pending_sent, pending_received, connected

    if (sentPing) {
      pingStatus = sentPing;
      canSendPing = false;
      
      if (sentPing.status === 'ACCEPTED') {
        canViewContact = true;
        relationshipStatus = 'connected';
      } else if (sentPing.status === 'PENDING') {
        relationshipStatus = 'pending_sent';
      }
    } else if (receivedPing) {
      pingStatus = receivedPing;
      
      if (receivedPing.status === 'ACCEPTED') {
        canViewContact = true;
        relationshipStatus = 'connected';
        canSendPing = false;
      } else if (receivedPing.status === 'PENDING') {
        relationshipStatus = 'pending_received';
        canSendPing = false;
      }
    }

    // Check if ping has expired and update if necessary
    if (pingStatus && pingStatus.status === 'PENDING' && new Date() > pingStatus.expiresAt) {
      await prisma.ping.update({
        where: { id: pingStatus.id },
        data: { status: 'EXPIRED' },
      });
      
      pingStatus.status = 'EXPIRED';
      relationshipStatus = 'none';
      canSendPing = true;
    }

    return NextResponse.json({
      pingStatus: pingStatus ? {
        id: pingStatus.id,
        status: pingStatus.status,
        createdAt: pingStatus.createdAt,
        expiresAt: pingStatus.expiresAt,
        message: pingStatus.message,
        isSender: pingStatus.senderId === session.user.id,
      } : null,
      canSendPing,
      canViewContact,
      relationshipStatus,
    });
  } catch (error) {
    console.error('Error getting ping status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}