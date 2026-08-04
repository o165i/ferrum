"use client";

import { useState } from "react";
import { ProductEditor } from "@/components/admin/ProductEditor";
import type { AdminProduct } from "@/types/admin";
import styles from "./AdminDashboard.module.css";

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-DE", { style: "currency", currency: "EUR" }).format(cents / 100);

export function ProductManager({ initialProducts }: { initialProducts: AdminProduct[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  function saveProduct(product: AdminProduct) {
    setProducts((current) => {
      const exists = current.some((item) => item.id === product.id);
      return exists
        ? current.map((item) => (item.id === product.id ? product : item))
        : [product, ...current];
    });
    setEditing(null);
    setCreating(false);
  }

  async function setActive(product: AdminProduct, isActive: boolean) {
    setError("");
    try {
      const response = await fetch(`/api/products/${encodeURIComponent(product.id)}`, {
        method: isActive ? "PUT" : "DELETE",
        headers: isActive ? { "Content-Type": "application/json" } : undefined,
        body: isActive ? JSON.stringify({ isActive: true }) : undefined,
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: { message?: string } };
        setError(data.error?.message ?? "Product status could not be changed.");
        return;
      }
      setProducts((current) =>
        current.map((item) => (item.id === product.id ? { ...item, isActive } : item))
      );
    } catch {
      setError("The product service is temporarily unavailable.");
    }
  }

  return (
    <section className={styles.manager} aria-labelledby="products-title">
      <div className={styles.sectionHeader}>
        <div><p>Catalog records</p><h2 id="products-title">Products</h2></div>
        <button type="button" onClick={() => { setCreating(true); setEditing(null); }}>New product</button>
      </div>
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      {creating || editing ? (
        <ProductEditor
          key={editing?.id ?? "new"}
          product={editing}
          onSaved={saveProduct}
          onCancel={() => { setCreating(false); setEditing(null); }}
        />
      ) : null}
      <div className={styles.tableWrap}>
        <table>
          <thead><tr><th>Ref / Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th><span className={styles.srOnly}>Actions</span></th></tr></thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td><strong>{product.ref}</strong><span>{product.name}</span></td>
                <td>{product.category}</td>
                <td>{formatPrice(product.saleCents ?? product.priceCents)}</td>
                <td>{product.stock}</td>
                <td><span className={product.isActive ? styles.active : styles.inactive}>{product.isActive ? "Active" : "Inactive"}</span></td>
                <td><div className={styles.rowActions}>
                  <button type="button" onClick={() => { setEditing(product); setCreating(false); }}>Edit</button>
                  <button type="button" onClick={() => setActive(product, !product.isActive)}>{product.isActive ? "Deactivate" : "Activate"}</button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
