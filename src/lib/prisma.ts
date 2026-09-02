import { PrismaClient } from "@prisma/client";
import { env } from "@/lib/env";

/**
 * В dev-режиме Next.js пересобирает модули при каждом hot-reload,
 * из-за чего наивный `new PrismaClient()` в теле модуля создавал бы
 * новое соединение на каждый reload и быстро исчерпал бы connection pool
 * у Postgres. Поэтому кладём единственный инстанс в globalThis.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
