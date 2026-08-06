import { NextResponse } from "next/server";
import { ConflictError, NotFoundError, toErrorResponse } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { updateOrderStatusSchema } from "@/lib/validation/order";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await requireAdmin();
    const { status } = updateOrderStatusSchema.parse(await request.json());

    const order = await prisma.$transaction(async (transaction) => {
      const existing = await transaction.order.findUnique({
        where: { id: params.id },
        include: { items: true },
      });
      if (!existing) throw new NotFoundError("Order not found");
      if (existing.status === "CANCELLED") {
        throw new ConflictError("A cancelled order cannot be changed");
      }
      if (existing.status === status) return existing;

      if (status === "CANCELLED") {
        const transition = await transaction.order.updateMany({
          where: { id: existing.id, status: { not: "CANCELLED" } },
          data: { status: "CANCELLED" },
        });
        if (transition.count !== 1) {
          throw new ConflictError("Order status changed. Reload the dashboard.");
        }
        for (const item of existing.items) {
          if (item.productId) {
            await transaction.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      } else {
        const transition = await transaction.order.updateMany({
          where: { id: existing.id, status: "PENDING" },
          data: { status: "CONFIRMED" },
        });
        if (transition.count !== 1) {
          throw new ConflictError("Only pending orders can be confirmed");
        }
      }

      const updated = await transaction.order.findUnique({
        where: { id: existing.id },
        include: { items: true },
      });
      if (!updated) throw new NotFoundError("Order not found");
      return updated;
    });

    logger.info(
      { orderId: order.id, status: order.status, adminUserId: session.user.id },
      "Order status updated"
    );
    return NextResponse.json({ order });
  } catch (error) {
    return toErrorResponse(error);
  }
}
