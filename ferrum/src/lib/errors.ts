import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { logger } from "@/lib/logger";

/**
 * Базовый класс для всех ожидаемых (доменных) ошибок.
 * У каждой — свой HTTP-статус и машиночитаемый код,
 * чтобы фронтенд мог реагировать на конкретный случай, а не только на текст.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message = "Invalid request data", public readonly issues?: unknown) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class UnauthenticatedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHENTICATED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Insufficient permissions") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(message, 409, "CONFLICT");
  }
}

type ErrorBody = {
  error: { code: string; message: string; issues?: unknown };
};

/**
 * Единая точка обработки ошибок для всех API route-хендлеров.
 * Гарантирует: наружу никогда не уходят stack trace, детали БД или секреты.
 * Используется так:
 *
 *   export async function GET(req: Request) {
 *     try { ... } catch (err) { return toErrorResponse(err); }
 *   }
 */
export function toErrorResponse(err: unknown): NextResponse<ErrorBody> {
  if (err instanceof ValidationError) {
    return NextResponse.json(
      { error: { code: err.code, message: err.message, issues: err.issues } },
      { status: err.status }
    );
  }

  if (err instanceof AppError) {
    return NextResponse.json(
      { error: { code: err.code, message: err.message } },
      { status: err.status }
    );
  }

  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
          issues: err.flatten(),
        },
      },
      { status: 400 }
    );
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002 = unique constraint violation
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: { code: "CONFLICT", message: "Resource already exists" } },
        { status: 409 }
      );
    }
    // P2025 = record not found (e.g. update/delete on missing row)
    if (err.code === "P2025") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Resource not found" } },
        { status: 404 }
      );
    }
  }

  // Всё, что не распознано выше — непредвиденная ошибка.
  // Логируем полностью на сервере, наружу отдаём только generic-сообщение.
  logger.error({ err }, "Unhandled error in API route");
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
    { status: 500 }
  );
}
