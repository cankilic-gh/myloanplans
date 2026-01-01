// Shared in-memory storage for verification codes
// In production, use Redis or database instead
// Note: In serverless environments, this Map persists only within the same process
// For production, use a proper database or Redis

// Use a global variable to persist across hot reloads in development
declare global {
  // eslint-disable-next-line no-var
  var __verificationCodes: Map<
    string,
    { code: string; expiresAt: number; email: string; name: string }
  > | undefined;
}

export const verificationCodes =
  global.__verificationCodes ??
  new Map<string, { code: string; expiresAt: number; email: string; name: string }>();

// In development, persist across hot reloads
if (process.env.NODE_ENV !== "production") {
  global.__verificationCodes = verificationCodes;
}





