import { NextRequest, NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/email";
import { verificationCodes } from "@/lib/verification-codes";
import { prisma } from "@/lib/prisma";
import { users } from "@/lib/users-storage";

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

    // Try to use database if available, fallback to in-memory
    if (prisma && typeof prisma.user !== 'undefined') {
      try {
        // Check if user already exists in database
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          console.log("[SIGNUP] ❌ User already exists:", email);
          return NextResponse.json(
            { error: "An account with this email already exists. Please sign in instead." },
            { status: 409 }
          );
        }

        // Create NEW user in database (no upsert - prevents data override)
        // In production, use bcrypt to hash password
        const user = await prisma.user.create({
          data: {
            name,
            email,
            password, // TODO: Hash with bcrypt in production
          },
        });

        console.log(`[SIGNUP] ✅ New user created in database: ${user.id}`);
      } catch (dbError) {
        console.error("[SIGNUP] Database error, falling back to in-memory:", dbError);
        // Fallback to in-memory if database fails
        users.set(email, { name, email, password });
        console.log(`[SIGNUP] User stored in memory (fallback)`);
      }
    } else {
      // No database connection - use in-memory storage
      console.log("[SIGNUP] No database connection, using in-memory storage");
      users.set(email, { name, email, password });
    }

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

    console.log(`[SIGNUP] Generated verification code for ${email}: ${verificationCode}`);
    console.log(`[SIGNUP] Code expires at: ${new Date(expiresAt).toISOString()}`);
    console.log(`[SIGNUP] Storage size: ${verificationCodes.size} codes stored`);

    // Send verification email
    let emailSent = false;
    let emailError: string | null = null;
    try {
      console.log(`[SIGNUP] Attempting to send verification email to: ${email}`);
      const emailResult = await sendVerificationEmail(email, name, verificationCode);
      emailSent = emailResult?.success || false;
      console.log(`[SIGNUP] Email sending result - success: ${emailSent}`);
      
      if (!emailSent) {
        emailError = emailResult?.error || "Email sending failed";
        console.warn("[SIGNUP] ⚠️ Email sending returned success=false");
        console.warn(`[SIGNUP] Error: ${emailError}`);
        console.warn("[SIGNUP] Code will be returned to client for development mode");
      } else {
        console.log(`[SIGNUP] ✅ Email sent successfully to ${email}`);
      }
    } catch (error) {
      emailError = error instanceof Error ? error.message : String(error);
      console.error("[SIGNUP] ❌ Email sending failed with error:", error);
      console.error("[SIGNUP] Error details:", emailError);
      
      // Check if it's a Resend API validation error (403 - test email restriction)
      const isResendValidationError = error instanceof Error && 
        (error.message.includes("validation_error") || 
         error.message.includes("You can only send testing emails"));
      
      if (isResendValidationError) {
        console.warn("[SIGNUP] ⚠️ Resend test mode restriction: Can only send to verified email");
        console.warn("[SIGNUP] Code will be returned to client for development mode");
      }
      // Even if email fails, continue in development mode
      // In production, you might want to handle this differently
    }

    // In serverless environments (like Vercel), in-memory storage doesn't persist
    // between requests. So we need to return the code to the client for storage.
    // Only return code if email sending failed (for fallback)
    // If email was successfully sent, don't return code (user should check email)
    const shouldReturnCode = !emailSent;
    
    return NextResponse.json({
      success: true,
      message: emailSent 
        ? "Account created. Check your email for verification code."
        : "Account created. Verification code is shown below (email sending failed).",
      // Return code ONLY if email sending failed (for fallback)
      verificationCode: shouldReturnCode ? verificationCode : undefined,
      codeExpiresAt: expiresAt,
      emailSent, // Indicate whether email was successfully sent
      // Return user info so client can store it (development only)
      user: {
        email,
        name,
        password, // In production, never return password
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

