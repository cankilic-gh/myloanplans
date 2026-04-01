import { NextRequest, NextResponse } from "next/server";
import { verificationCodes } from "@/lib/verification-codes";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code, codeExpiresAt, clientCode } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      );
    }

    // Get stored verification data from server-side storage
    let storedData = verificationCodes.get(email);

    // In serverless environments (Vercel), in-memory storage may not persist
    // If server-side data not found, use client-side data (from sessionStorage)
    if (!storedData && clientCode && codeExpiresAt) {
      const expiresAt = parseInt(codeExpiresAt);

      if (Date.now() > expiresAt) {
        return NextResponse.json(
          { error: "Verification code has expired" },
          { status: 400 }
        );
      }

      storedData = {
        code: clientCode,
        expiresAt,
        email,
        name: "",
      };
    }

    if (!storedData) {
      return NextResponse.json(
        { error: "Verification code not found or expired" },
        { status: 400 }
      );
    }

    // Check if code is expired
    if (Date.now() > storedData.expiresAt) {
      verificationCodes.delete(email);
      return NextResponse.json(
        { error: "Verification code has expired" },
        { status: 400 }
      );
    }

    // Verify code
    if (storedData.code !== code) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Code is valid, remove it from storage
    verificationCodes.delete(email);

    // Mark email as verified in database and get user data
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    // Create response with auth cookie (auto-login after verification)
    const response = NextResponse.json({
      success: true,
      message: "Email verified successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name || "User",
      },
    });

    await createSession(response, { id: user.id, email: user.email });

    return response;
  } catch (error) {
    console.error("[VERIFY] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
