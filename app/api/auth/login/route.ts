import { NextRequest, NextResponse } from "next/server";
import { prisma, isPrismaReady } from "@/lib/prisma";
import { users } from "@/lib/users-storage";

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

    let user: { name: string | null; email: string; password?: string | null } | null = null;

    // Try database first
    if (prisma && isPrismaReady()) {
      try {
        console.log("[LOGIN] 🔍 Querying database...");
        
        // Explicit connection to prevent cold start issues
        await prisma.$connect();
        
        user = await prisma.user.findUnique({
          where: { email },
          select: { name: true, email: true, password: true },
        });
        
        console.log("[LOGIN] ✅ Database query successful. User found:", !!user);
      } catch (dbError: any) {
        console.error("[LOGIN] ❌ DATABASE ERROR:", {
          message: dbError.message,
          code: dbError.code,
          cause: dbError.cause,
        });
        
        // Fallback to in-memory on DB error
        console.warn("[LOGIN] ⚠️ Falling back to in-memory storage");
        const memUser = users.get(email);
        if (memUser) {
          user = { name: memUser.name, email: memUser.email, password: memUser.password };
          console.log("[LOGIN] ✅ User found in memory (fallback)");
        }
      }
    } else {
      // No Prisma - use in-memory storage
      console.warn("[LOGIN] ⚠️ Prisma not available, using in-memory storage");
      const memUser = users.get(email);
      if (memUser) {
        user = { name: memUser.name, email: memUser.email, password: memUser.password };
      }
      console.log("[LOGIN] User found in memory:", !!user);
      console.log("[LOGIN] Total users in memory:", users.size);
    }

    // GRANULAR ERROR HANDLING (as requested by user)
    
    // Scenario A: User not found
    if (!user) {
      console.log("[LOGIN] ❌ User not found");
      return NextResponse.json(
        { error: "No account found with this email address" },
        { status: 404 }
      );
    }

    // Scenario A.2: No password set (edge case)
    if (!user.password) {
      console.log("[LOGIN] ❌ No password set for user");
      return NextResponse.json(
        { error: "No account found with this email address" },
        { status: 404 }
      );
    }

    // Scenario B: Password mismatch
    // In production, use bcrypt.compare() for hashed passwords
    if (user.password !== password) {
      console.log("[LOGIN] ❌ Password mismatch");
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }

    console.log("[LOGIN] ✅ Login successful for:", email);

    // Login successful
    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        email: user.email,
        name: user.name,
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




