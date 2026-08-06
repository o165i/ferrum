"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import type { Product } from "@/types/product";
import styles from "./AddToBag.module.css";

const FALLBACK_IMAGE = "https://picsum.photos/seed/ferrum-placeholder/900/1150";

export function AddToBag({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [size, setSize] = useState(product.sizes[0] ?? "ONE SIZE");
  const [added, setAdded] = useState(false);
  const unavailable = product.stock === 0 || product.sizes.length === 0;

  function handleAdd() {
    addItem({
      productId: product.id,
      ref: product.ref,
      name: product.name,
      image: product.images[0] ?? FALLBACK_IMAGE,
      size,
      unitPriceCents: product.saleCents ?? product.priceCents,
      quantity: 1,
      availableStock: product.stock,
    });
    setAdded(true);
  }

  return (
    <div className={styles.controls}>
      <label>
        <span className={styles.visuallyHidden}>Size for {product.name}</span>
        <select
          className={styles.select}
          value={size}
          onChange={(event) => {
            setSize(event.target.value);
            setAdded(false);
          }}
          disabled={unavailable}
        >
          {product.sizes.map((productSize) => (
            <option key={productSize} value={productSize}>{productSize}</option>
          ))}
        </select>
      </label>
      <button className={styles.button} type="button" onClick={handleAdd} disabled={unavailable}>
        {unavailable ? "Unavailable" : added ? "Added" : "Add to bag"}
      </button>
    </div>
  );
}
