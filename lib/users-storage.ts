// Server-side user storage (in production, use database)
// Format: email -> { name, email, password }

// Use a global variable to persist across hot reloads in development
declare global {
  // eslint-disable-next-line no-var
  var __users: Map<string, { name: string; email: string; password: string }> | undefined;
}

export const users =
  global.__users ??
  new Map<string, { name: string; email: string; password: string }>();

// In development, persist across hot reloads
if (process.env.NODE_ENV !== "production") {
  global.__users = users;
}





