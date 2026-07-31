import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * GET /api/health
 * Liveness + readiness в одном: если процесс отвечает — жив.
 * Если ещё и БД отвечает — готов принимать трафик.
 * Не требует аутентификации: инфраструктура должна иметь к нему доступ всегда.
 */
export async function GET() {
  const checks: Record<string, "ok" | "error"> = { server: "ok" };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch (err) {
    checks.database = "error";
    logger.error({ err }, "Health check: database unreachable");
  }

  const healthy = Object.values(checks).every((v) => v === "ok");

  return NextResponse.json(
    { status: healthy ? "ok" : "degraded", checks, timestamp: new Date().toISOString() },
    { status: healthy ? 200 : 503 }
  );
}
