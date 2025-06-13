import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";
import { UserRole } from "@/auth";
import { trackInviteCodeRegistration } from "@/lib/invite-analytics";

// Validation schema for registration
const registerSchema = z.object({
  email: z.string().email({
    message: "Invalid email address",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
  inviteCode: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request data
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const { errors } = result.error;
      return NextResponse.json(
        { message: "Invalid input data", errors },
        { status: 400 }
      );
    }

    const { email, password, inviteCode } = result.data;

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // If invite code provided, validate it
    let inviteCodeRecord = null;
    if (inviteCode) {
      inviteCodeRecord = await db.inviteCode.findUnique({
        where: { code: inviteCode },
      });

      if (!inviteCodeRecord) {
        return NextResponse.json(
          { message: "Invalid invite code" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        role: UserRole.USER,
        inviterId: inviteCodeRecord?.userId || null,
      },
    });

    // If invite code was used, track the completion
    if (inviteCode && inviteCodeRecord) {
      try {
        await trackInviteCodeRegistration(inviteCode, user.id);
      } catch (error) {
        console.error("Failed to track invite code registration:", error);
        // Don't fail registration if analytics tracking fails
      }
    }

    // Remove sensitive data
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
