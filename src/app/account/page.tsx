import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Account — FERRUM" };
export const dynamic = "force-dynamic";

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-DE", { style: "currency", currency: "EUR" }).format(cents / 100);

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/account");
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
    take: 20,
  });

  return (
    <section className={styles.account} aria-labelledby="account-title">
      <p className={styles.kicker}>Authenticated session</p>
      <h1 id="account-title" className={styles.title}>Account</h1>
      <dl className={styles.details}>
        <div className={styles.row}><dt>Name</dt><dd>{session.user.name || "Not provided"}</dd></div>
        <div className={styles.row}><dt>Email</dt><dd>{session.user.email}</dd></div>
        <div className={styles.row}><dt>Role</dt><dd>{session.user.role}</dd></div>
      </dl>
      <section className={styles.orders} aria-labelledby="orders-title">
        <h2 id="orders-title">Orders</h2>
        {orders.length === 0 ? (
          <p className={styles.emptyOrders}>No orders yet.</p>
        ) : (
          <ul>
            {orders.map((order) => (
              <li key={order.id}>
                <div><strong>{order.orderNumber}</strong><span>{order.items.length} item(s) · {order.status}</span></div>
                <div><span>{order.createdAt.toLocaleDateString("en-DE")}</span><strong>{formatPrice(order.totalCents)}</strong></div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <SignOutButton />
    </section>
  );
}
