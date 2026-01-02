import { NextRequest, NextResponse } from "next/server";
import { verificationCodes } from "@/lib/verification-codes";

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

    console.log(`[VERIFY] Looking for email: ${email}`);
    console.log(`[VERIFY] Storage size: ${verificationCodes.size} codes stored`);
    console.log(`[VERIFY] Available emails:`, Array.from(verificationCodes.keys()));

    // In serverless environments (Vercel), in-memory storage may not persist
    // If server-side data not found, use client-side data (from sessionStorage)
    if (!storedData && clientCode && codeExpiresAt) {
      console.log(`[VERIFY] Server-side data not found, using client-side data`);
      const expiresAt = parseInt(codeExpiresAt);
      
      // Check if code is expired
      if (Date.now() > expiresAt) {
        return NextResponse.json(
          { error: "Verification code has expired" },
          { status: 400 }
        );
      }

      // Use client-side code for verification
      storedData = {
        code: clientCode,
        expiresAt,
        email,
        name: "", // Will be retrieved from users storage
      };
    }

    if (!storedData) {
      console.error(`[VERIFY] No verification data found for email: ${email}`);
      console.error(`[VERIFY] Available emails in storage:`, Array.from(verificationCodes.keys()));
      
      return NextResponse.json(
        { error: "Verification code not found or expired" },
        { status: 400 }
      );
    }

    console.log(`[VERIFY] Found verification data for ${email}`);
    console.log(`[VERIFY] Code expires at: ${new Date(storedData.expiresAt).toISOString()}`);
    console.log(`[VERIFY] Current time: ${new Date().toISOString()}`);

    // Check if code is expired
    if (Date.now() > storedData.expiresAt) {
      verificationCodes.delete(email);
      return NextResponse.json(
        { error: "Verification code has expired" },
        { status: 400 }
      );
    }

    // Verify code
    console.log(`[VERIFY] Comparing codes - Stored: ${storedData.code}, Provided: ${code}`);
    if (storedData.code !== code) {
      console.error(`[VERIFY] Code mismatch! Stored: ${storedData.code}, Provided: ${code}`);
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    console.log(`[VERIFY] Code verified successfully for ${email}`);

    // Code is valid, remove it from storage
    verificationCodes.delete(email);

    // Try to mark email as verified in database (if available)
    let userName = storedData.name;
    
    try {
      const hasDatabaseConnection = process.env.DATABASE_URL;
      if (hasDatabaseConnection) {
        const { prisma } = await import("@/lib/prisma");
        if (prisma && typeof prisma.user !== 'undefined') {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            // Mark email as verified
            await prisma.user.update({
              where: { email },
              data: { emailVerified: new Date() },
            });
            console.log(`[VERIFY] ✅ Email verified in database for user: ${user.id}`);
            userName = user.name || userName;
          }
        }
      }
    } catch (error) {
      console.log(`[VERIFY] Could not update database (fallback mode):`, error);
      // Continue without database update - not critical for verification flow
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
      user: {
        email: email,
        name: userName || "User",
      },
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}






