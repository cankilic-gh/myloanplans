import { NextRequest, NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/email";
import { verificationCodes } from "@/lib/verification-codes";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);

    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        emailVerified: null,
      },
    });

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store verification code
    verificationCodes.set(email, {
      code: verificationCode,
      expiresAt,
      email,
      name,
    });

    // Send verification email
    let emailSent = false;
    try {
      const emailResult = await sendVerificationEmail(email, name, verificationCode);
      emailSent = emailResult?.success || false;
    } catch (error) {
      console.error("[SIGNUP] Email sending failed:", error);
    }

    const shouldReturnCode = !emailSent;

    return NextResponse.json({
      success: true,
      message: emailSent
        ? "Account created. Check your email for verification code."
        : "Account created. Verification code is shown below (email sending failed).",
      verificationCode: shouldReturnCode ? verificationCode : undefined,
      codeExpiresAt: expiresAt,
      emailSent,
    });
  } catch (error) {
    console.error("[SIGNUP] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
