import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Admin — FERRUM" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/account");

  const [products, orders] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
      take: 100,
    }),
  ]);

  return (
    <AdminDashboard
      initialProducts={products.map((product) => ({
        ...product,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      }))}
      initialOrders={orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentMethod: order.paymentMethod,
        contactName: order.contactName,
        contactEmail: order.contactEmail,
        phone: order.phone,
        addressLine1: order.addressLine1,
        addressLine2: order.addressLine2,
        city: order.city,
        postalCode: order.postalCode,
        country: order.country,
        totalCents: order.totalCents,
        createdAt: order.createdAt.toISOString(),
        items: order.items.map((item) => ({
          id: item.id,
          productRef: item.productRef,
          productName: item.productName,
          size: item.size,
          quantity: item.quantity,
          lineTotalCents: item.lineTotalCents,
        })),
      }))}
    />
  );
}
