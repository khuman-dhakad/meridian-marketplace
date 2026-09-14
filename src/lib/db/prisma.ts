import { PrismaClient } from "@prisma/client";

declare global {
  // Allow global `var` declarations for Node.js global singleton
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    log: [],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

/**
 * Checks if the database is configured and reachable.
 * Performs a lightweight health query (SELECT 1).
 */
export async function isDatabaseConnected(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  try {
    // Attempt a lightweight raw query with a short timeout
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
