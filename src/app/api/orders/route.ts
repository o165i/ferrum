import { NextResponse } from "next/server";
import { ConflictError, NotFoundError, ValidationError, toErrorResponse } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { createOrderSchema } from "@/lib/validation/order";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAuth();
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { items: true },
      take: 50,
    });
    return NextResponse.json({ orders });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const input = createOrderSchema.parse(await request.json());
    const productIds = [...new Set(input.items.map((item) => item.productId))];

    const order = await prisma.$transaction(async (transaction) => {
      const products = await transaction.product.findMany({
        where: { id: { in: productIds }, isActive: true },
      });
      const productMap = new Map(products.map((product) => [product.id, product]));

      if (products.length !== productIds.length) {
        throw new NotFoundError("One or more products are unavailable");
      }

      const itemData = input.items.map((item) => {
        const product = productMap.get(item.productId);
        if (!product) throw new NotFoundError("Product is unavailable");
        if (!product.sizes.includes(item.size)) {
          throw new ValidationError(`${product.name} is not available in size ${item.size}`);
        }
        if (product.stock < item.quantity) {
          throw new ConflictError(`Not enough stock for ${product.name}`);
        }
        const unitPriceCents = product.saleCents ?? product.priceCents;
        return {
          productId: product.id,
          productRef: product.ref,
          productName: product.name,
          size: item.size,
          quantity: item.quantity,
          unitPriceCents,
          lineTotalCents: unitPriceCents * item.quantity,
        };
      });

      for (const item of input.items) {
        const result = await transaction.product.updateMany({
          where: { id: item.productId, isActive: true, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (result.count !== 1) {
          throw new ConflictError("Product stock changed. Please review your bag.");
        }
      }

      const subtotalCents = itemData.reduce((total, item) => total + item.lineTotalCents, 0);
      const orderNumber = `FR-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

      return transaction.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          status: "PENDING",
          paymentMethod: input.paymentMethod,
          contactName: input.contactName,
          contactEmail: input.contactEmail,
          phone: input.phone,
          addressLine1: input.addressLine1,
          addressLine2: input.addressLine2 || null,
          city: input.city,
          postalCode: input.postalCode,
          country: input.country,
          subtotalCents,
          totalCents: subtotalCents,
          items: { create: itemData },
        },
        include: { items: true },
      });
    });

    logger.info({ orderId: order.id, orderNumber: order.orderNumber, userId: session.user.id }, "Order created");
    return NextResponse.json(
      {
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalCents: order.totalCents,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
