import { NextResponse } from "next/server";
import { signToken } from "./jwt";

export async function createSession(
  response: NextResponse,
  user: { id: string; email: string }
): Promise<NextResponse> {
  const token = await signToken({ userId: user.id, email: user.email });
  response.cookies.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return response;
}

export function destroySession(response: NextResponse): NextResponse {
  response.cookies.set("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
