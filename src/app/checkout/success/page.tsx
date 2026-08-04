import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Order received — FERRUM" };
export const dynamic = "force-dynamic";

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-DE", { style: "currency", currency: "EUR" }).format(cents / 100);

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: { order?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/account");
  if (!searchParams.order) notFound();

  const order = await prisma.order.findFirst({
    where: { orderNumber: searchParams.order, userId: session.user.id },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <section className={styles.page} aria-labelledby="success-title">
      <p className={styles.kicker}>Order received</p>
      <h1 id="success-title">Thank you</h1>
      <p className={styles.intro}>Your order has been saved. No online payment has been taken.</p>
      <dl className={styles.details}>
        <div><dt>Order</dt><dd>{order.orderNumber}</dd></div>
        <div><dt>Status</dt><dd>{order.status}</dd></div>
        <div><dt>Total</dt><dd>{formatPrice(order.totalCents)}</dd></div>
        <div><dt>Delivery</dt><dd>{order.addressLine1}, {order.postalCode} {order.city}, {order.country}</dd></div>
      </dl>
      <h2>Items</h2>
      <ul className={styles.items}>
        {order.items.map((item) => (
          <li key={item.id}><span>{item.productName} / {item.size} × {item.quantity}</span><strong>{formatPrice(item.lineTotalCents)}</strong></li>
        ))}
      </ul>
      <div className={styles.actions}><Link className="primaryAction" href="/account">View account</Link><Link href="/catalog">Continue shopping</Link></div>
    </section>
  );
}
