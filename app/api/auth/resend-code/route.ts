import { NextRequest, NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/email";
import { verificationCodes } from "@/lib/verification-codes";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if there's existing verification data
    let existingData = verificationCodes.get(email);

    // In serverless environments, data might not persist
    // Allow resend even if server-side data is missing (client will store it)
    if (!existingData) {
      // Try to get user info from users storage
      const { users } = await import("@/lib/users-storage");
      const user = users.get(email);
      if (user) {
        existingData = {
          email,
          name: user.name,
          code: "",
          expiresAt: 0,
        };
      } else {
        return NextResponse.json(
          { error: "No pending verification found for this email" },
          { status: 400 }
        );
      }
    }

    // Generate new code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Update stored verification code
    verificationCodes.set(email, {
      ...existingData,
      code: verificationCode,
      expiresAt,
    });

    // Send new verification email
    let emailSent = false;
    try {
      const emailResult = await sendVerificationEmail(email, existingData.name, verificationCode);
      emailSent = emailResult?.success || false;
    } catch (error) {
      console.error("Email sending failed:", error);
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({
          success: true,
          message: "New verification code sent",
          verificationCode: process.env.NODE_ENV === "development" ? verificationCode : undefined,
          codeExpiresAt: expiresAt,
          emailSent: false,
        });
      }
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "New verification code sent to your email",
      // Return code for client-side storage (needed in serverless environments)
      verificationCode: !emailSent ? verificationCode : undefined,
      codeExpiresAt: expiresAt,
      emailSent,
    });
  } catch (error) {
    console.error("Resend code error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

