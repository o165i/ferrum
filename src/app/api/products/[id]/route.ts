import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateProductSchema } from "@/lib/validation/product";
import { requireAdmin } from "@/lib/session";
import { NotFoundError, toErrorResponse } from "@/lib/errors";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

/** GET /api/products/:id — публичный */
export async function GET(_req: Request, { params }: Params) {
  try {
    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product || !product.isActive) {
      throw new NotFoundError("Product not found");
    }
    return NextResponse.json({ product });
  } catch (err) {
    return toErrorResponse(err);
  }
}

/** PUT /api/products/:id — только ADMIN */
export async function PUT(req: Request, { params }: Params) {
  try {
    await requireAdmin();

    const body = await req.json();
    const data = updateProductSchema.parse(body);

    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) {
      throw new NotFoundError("Product not found");
    }

    const product = await prisma.product.update({ where: { id: params.id }, data });

    logger.info({ productId: product.id }, "Product updated");

    return NextResponse.json({ product });
  } catch (err) {
    return toErrorResponse(err);
  }
}

/** DELETE /api/products/:id — только ADMIN, мягкое удаление (isActive=false) */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    await requireAdmin();

    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) {
      throw new NotFoundError("Product not found");
    }

    await prisma.product.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    logger.info({ productId: params.id }, "Product deactivated");

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
