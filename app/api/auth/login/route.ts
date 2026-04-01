import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true, emailVerified: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email address" },
        { status: 404 }
      );
    }

    // User exists but has no password (e.g. migrated from OAuth-only)
    if (!user.password) {
      return NextResponse.json(
        { error: "Please reset your password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check email verification
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email address first" },
        { status: 403 }
      );
    }

    // Create response and set auth cookie
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name || email.split("@")[0],
      },
    });

    await createSession(response, { id: user.id, email: user.email });

    return response;
  } catch (error) {
    console.error("[LOGIN] Unexpected error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
