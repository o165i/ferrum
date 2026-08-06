"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminOrder } from "@/types/admin";
import styles from "./AdminDashboard.module.css";

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-DE", { style: "currency", currency: "EUR" }).format(cents / 100);

export function OrderManager({ initialOrders }: { initialOrders: AdminOrder[] }) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function updateStatus(orderId: string, status: "CONFIRMED" | "CANCELLED") {
    setBusyId(orderId);
    setError("");
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = (await response.json()) as { order?: AdminOrder; error?: { message?: string } };
      if (!response.ok || !data.order) {
        setError(data.error?.message ?? "Order status could not be changed.");
        return;
      }
      const updatedOrder = data.order;
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? { ...order, status: updatedOrder.status } : order))
      );
      router.refresh();
    } catch {
      setError("The order service is temporarily unavailable.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className={styles.manager} aria-labelledby="admin-orders-title">
      <div className={styles.sectionHeader}><div><p>Latest 100</p><h2 id="admin-orders-title">Orders</h2></div></div>
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      {orders.length === 0 ? <p className={styles.empty}>No orders yet.</p> : (
        <div className={styles.orderList}>
          {orders.map((order) => (
            <article key={order.id} className={styles.orderCard}>
              <header>
                <div><strong>{order.orderNumber}</strong><span>{new Date(order.createdAt).toLocaleString("en-DE")}</span></div>
                <span className={styles[order.status.toLowerCase()]}>{order.status}</span>
              </header>
              <div className={styles.orderGrid}>
                <div><h3>Customer</h3><p>{order.contactName}</p><p>{order.contactEmail}</p><p>{order.phone}</p></div>
                <div><h3>Delivery</h3><p>{order.addressLine1}{order.addressLine2 ? `, ${order.addressLine2}` : ""}</p><p>{order.postalCode} {order.city}</p><p>{order.country}</p></div>
                <div><h3>Items</h3>{order.items.map((item) => <p key={item.id}>{item.productRef} / {item.size} × {item.quantity}</p>)}</div>
                <div><h3>Total</h3><strong>{formatPrice(order.totalCents)}</strong><p>{order.paymentMethod.replaceAll("_", " ")}</p></div>
              </div>
              {order.status !== "CANCELLED" ? (
                <footer className={styles.orderActions}>
                  {order.status === "PENDING" ? <button type="button" disabled={busyId === order.id} onClick={() => updateStatus(order.id, "CONFIRMED")}>Confirm</button> : null}
                  <button type="button" disabled={busyId === order.id} onClick={() => updateStatus(order.id, "CANCELLED")}>Cancel & restore stock</button>
                </footer>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
