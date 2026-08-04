"use client";

import { useState } from "react";
import { PRODUCT_CATEGORIES } from "@/types/product";
import type { AdminProduct } from "@/types/admin";
import styles from "./AdminDashboard.module.css";

const parseList = (value: FormDataEntryValue | null) =>
  [...new Set(String(value ?? "").split(/[\n,]+/).map((item) => item.trim()).filter(Boolean))];

export function ProductEditor({
  product,
  onSaved,
  onCancel,
}: {
  product: AdminProduct | null;
  onSaved: (product: AdminProduct) => void;
  onCancel: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const salePrice = String(form.get("salePrice") ?? "").trim();
    const payload = {
      ref: form.get("ref"),
      name: form.get("name"),
      slug: form.get("slug"),
      category: form.get("category"),
      color: form.get("color"),
      priceCents: Math.round(Number(form.get("price")) * 100),
      saleCents: salePrice ? Math.round(Number(salePrice) * 100) : null,
      description: form.get("description"),
      sizes: parseList(form.get("sizes")),
      images: parseList(form.get("images")),
      stock: Number(form.get("stock")),
      popularityScore: Number(form.get("popularityScore")),
      isActive: form.get("isActive") === "on",
    };

    try {
      const response = await fetch(product ? `/api/products/${encodeURIComponent(product.id)}` : "/api/products", {
        method: product ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { product?: AdminProduct; error?: { message?: string } };
      if (!response.ok || !data.product) {
        setError(data.error?.message ?? "Product could not be saved.");
        return;
      }
      onSaved(data.product);
    } catch {
      setError("The product service is temporarily unavailable.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.editor} onSubmit={handleSubmit}>
      <div className={styles.editorHeading}><h3>{product ? `Edit ${product.ref}` : "New product"}</h3><button type="button" onClick={onCancel}>Close</button></div>
      <div className={styles.formGrid}>
        <label><span>Reference</span><input name="ref" defaultValue={product?.ref} required maxLength={20} /></label>
        <label><span>Name</span><input name="name" defaultValue={product?.name} required maxLength={120} /></label>
        <label><span>Slug</span><input name="slug" defaultValue={product?.slug} required pattern="[a-z0-9-]+" /></label>
        <label><span>Category</span><select name="category" defaultValue={product?.category ?? PRODUCT_CATEGORIES[0]}>{PRODUCT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label>
        <label><span>Color</span><input name="color" defaultValue={product?.color} required /></label>
        <label><span>Regular price, EUR</span><input name="price" type="number" min="0.01" step="0.01" defaultValue={product ? product.priceCents / 100 : ""} required /></label>
        <label><span>Sale price, EUR (optional)</span><input name="salePrice" type="number" min="0.01" step="0.01" defaultValue={product?.saleCents ? product.saleCents / 100 : ""} /></label>
        <label><span>Stock</span><input name="stock" type="number" min="0" step="1" defaultValue={product?.stock ?? 0} required /></label>
        <label><span>Popularity</span><input name="popularityScore" type="number" min="0" step="1" defaultValue={product?.popularityScore ?? 0} required /></label>
        <label className={styles.full}><span>Sizes, separated by commas</span><input name="sizes" defaultValue={product?.sizes.join(", ") ?? "XS, S, M, L, XL"} required /></label>
        <label className={styles.full}><span>Image URLs, one per line</span><textarea name="images" defaultValue={product?.images.join("\n")} rows={3} required /></label>
        <label className={styles.full}><span>Description</span><textarea name="description" defaultValue={product?.description} rows={4} /></label>
        <label className={styles.check}><input name="isActive" type="checkbox" defaultChecked={product?.isActive ?? true} /><span>Active in catalog</span></label>
      </div>
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      <button className={styles.save} type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save product"}</button>
    </form>
  );
}
