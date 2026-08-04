"use client";

import { useState } from "react";
import { OrderManager } from "@/components/admin/OrderManager";
import { ProductManager } from "@/components/admin/ProductManager";
import type { AdminOrder, AdminProduct } from "@/types/admin";
import styles from "./AdminDashboard.module.css";

export function AdminDashboard({
  initialProducts,
  initialOrders,
}: {
  initialProducts: AdminProduct[];
  initialOrders: AdminOrder[];
}) {
  const [view, setView] = useState<"products" | "orders">("products");
  const pendingOrders = initialOrders.filter((order) => order.status === "PENDING").length;

  return (
    <section className={styles.page} aria-labelledby="admin-title">
      <header className={styles.header}>
        <div><p>Restricted / ADMIN</p><h1 id="admin-title">Dashboard</h1></div>
        <dl className={styles.metrics}>
          <div><dt>Products</dt><dd>{initialProducts.length}</dd></div>
          <div><dt>Active</dt><dd>{initialProducts.filter((product) => product.isActive).length}</dd></div>
          <div><dt>Pending orders</dt><dd>{pendingOrders}</dd></div>
        </dl>
      </header>
      <nav className={styles.tabs} aria-label="Admin sections">
        <button type="button" aria-pressed={view === "products"} onClick={() => setView("products")}>Products</button>
        <button type="button" aria-pressed={view === "orders"} onClick={() => setView("orders")}>Orders</button>
      </nav>
      {view === "products" ? (
        <ProductManager initialProducts={initialProducts} />
      ) : (
        <OrderManager initialOrders={initialOrders} />
      )}
    </section>
  );
}
