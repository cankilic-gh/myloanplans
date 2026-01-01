import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log("[LOGIN] 🔐 Attempting login for:", email);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();

    // Try Supabase Auth first
    console.log("[LOGIN] 🔍 Attempting Supabase Auth login...");
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.log("[LOGIN] ❌ Supabase Auth error:", authError.message);
      
      // Check if it's a user not found error
      if (authError.message.includes("Invalid login credentials") || 
          authError.message.includes("Email not confirmed") ||
          authError.message.includes("User not found")) {
        return NextResponse.json(
          { error: "No account found with this email address" },
          { status: 404 }
        );
      }

      // For other errors, return generic error
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }

    if (!authData.user) {
      console.log("[LOGIN] ❌ No user returned from Supabase Auth");
      return NextResponse.json(
        { error: "No account found with this email address" },
        { status: 404 }
      );
    }

    console.log("[LOGIN] ✅ Supabase Auth login successful");

    // Get user metadata from Prisma database (for name and other data)
    let userName: string | null = null;
    if (prisma) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email },
          select: { name: true },
        });
        userName = dbUser?.name || null;
      } catch (dbError) {
        console.warn("[LOGIN] ⚠️ Could not fetch user name from database:", dbError);
        // Use metadata from Supabase if available
        userName = authData.user.user_metadata?.name || null;
      }
    } else {
      // Use metadata from Supabase if Prisma is not available
      userName = authData.user.user_metadata?.name || null;
    }

    // Login successful
    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        email: authData.user.email!,
        name: userName,
        id: authData.user.id,
      },
    });
  } catch (error) {
    console.error("[LOGIN] ❌ Unexpected error:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}





