import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createProductSchema, listProductsQuerySchema } from "@/lib/validation/product";
import { requireAdmin } from "@/lib/session";
import { toErrorResponse } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/products
 * Публичный список товаров с фильтрацией/поиском/сортировкой/пагинацией.
 * По умолчанию отдаём только isActive=true — неактивные товары видны
 * только через админский CRUD.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = listProductsQuerySchema.parse(Object.fromEntries(url.searchParams));

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(query.category ? { category: query.category } : {}),
      ...(query.color ? { color: { equals: query.color, mode: "insensitive" } } : {}),
      ...(query.search
        ? { name: { contains: query.search, mode: "insensitive" as const } }
        : {}),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      query.sort === "price_asc"
        ? { priceCents: "asc" }
        : query.sort === "price_desc"
          ? { priceCents: "desc" }
          : { createdAt: "desc" };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      items,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}

/**
 * POST /api/products
 * Только для ADMIN. Авторизация проверяется на backend (requireAdmin),
 * а не только скрытием кнопки на фронтенде.
 */
export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();
    const data = createProductSchema.parse(body);

    const product = await prisma.product.create({ data });

    logger.info({ productId: product.id }, "Product created");

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
