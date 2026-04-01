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

      if (authError.message.includes("Email not confirmed")) {
        return NextResponse.json(
          { error: "Please verify your email address first" },
          { status: 403 }
        );
      }

      if (authError.message.includes("Invalid login credentials")) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: "Login failed. Please try again." },
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

    // Get user name: try Prisma first, fall back to Supabase metadata
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
      }
    }
    // Fall back to Supabase Auth metadata if name not found in DB
    if (!userName) {
      userName = authData.user.user_metadata?.name || email.split("@")[0];
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
  } catch (error: any) {
    console.error("[LOGIN] ❌ Unexpected error:", error?.message || error);
    console.error("[LOGIN] ❌ Stack:", error?.stack);
    console.error("[LOGIN] ❌ Cause:", error?.cause?.message || error?.cause);
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen tekrar deneyin.", detail: error?.message || String(error) },
      { status: 500 }
    );
  }
}





