import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  isConnected: boolean;
};

function createPrismaClient(): PrismaClient {
  // Prisma 7 with SQLite - use default configuration
  // For SQLite, we don't need adapter or accelerateUrl
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  return client;
}

// Singleton pattern - ensure only one instance
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = createPrismaClient();
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };

// Warm up connection on server startup (prevents cold start issues)
if (!globalForPrisma.isConnected && typeof window === 'undefined') {
  prisma.$connect()
    .then(() => {
      globalForPrisma.isConnected = true;
      console.log("[PRISMA] 🔥 Database connection warmed up and ready");
    })
    .catch((error) => {
      console.error("[PRISMA] ❌ Failed to warm up connection:", error);
      console.error("[PRISMA] First query may be slow or fail. Retrying on next request...");
    });
}

// Preserve instance in development to prevent hot-reload issues
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Helper function to check if Prisma is ready
export function isPrismaReady(): boolean {
  return prisma !== null && typeof prisma.user !== 'undefined';
}

