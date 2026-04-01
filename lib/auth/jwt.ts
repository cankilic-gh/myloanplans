import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET || "fallback-dev-secret");

export interface TokenPayload {
  userId: string;
  email: string;
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const cookie = request.cookies.get("auth-token");
  return cookie?.value || null;
}
