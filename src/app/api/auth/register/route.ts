import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation/auth";
import { ConflictError, toErrorResponse } from "@/lib/errors";
import { logger } from "@/lib/logger";

const BCRYPT_ROUNDS = 12;

/**
 * POST /api/auth/register
 * Публичный endpoint. Всегда создаёт роль USER — повышение до ADMIN
 * возможно только напрямую в БД/через seed, никогда через этот роут.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    logger.info({ userId: user.id }, "User registered");

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
