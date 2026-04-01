import { NextRequest } from "next/server";
import { getTokenFromRequest, verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";

export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  // Primary: JWT from auth cookie
  const token = getTokenFromRequest(request);

  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      return payload.userId;
    }
  }

  // Fallback: x-user-email header (backwards compatibility during transition)
  const userEmail = request.headers.get("x-user-email");

  if (!userEmail) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });

    return user?.id || null;
  } catch (error) {
    console.error("[API] Error resolving user from email header:", error);
    return null;
  }
}
