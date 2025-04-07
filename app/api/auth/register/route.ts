import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";
import { UserRole } from "@/auth";

// Validation schema for registration
const registerSchema = z.object({
  email: z.string().email({
    message: "Invalid email address",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
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

    const { email, password } = result.data;

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

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        role: UserRole.USER,
      },
    });

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
