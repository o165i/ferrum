"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import styles from "./CartPage.module.css";

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-DE", { style: "currency", currency: "EUR" }).format(cents / 100);

export function CartPage() {
  const { items, subtotalCents, hydrated, setQuantity, removeItem } = useCart();

  if (!hydrated) return <section className={styles.page}><p>Loading bag…</p></section>;

  if (items.length === 0) {
    return (
      <section className={styles.empty} aria-labelledby="bag-title">
        <p className={styles.kicker}>Shopping bag</p>
        <h1 id="bag-title">Your bag is empty</h1>
        <Link className="primaryAction" href="/catalog">Open catalog</Link>
      </section>
    );
  }

  return (
    <section className={styles.page} aria-labelledby="bag-title">
      <header className={styles.header}>
        <p className={styles.kicker}>Shopping bag</p>
        <h1 id="bag-title">Bag</h1>
      </header>
      <div className={styles.layout}>
        <div className={styles.items}>
          {items.map((item) => (
            <article className={styles.item} key={`${item.productId}:${item.size}`}>
              <div className={styles.imageFrame}>
                <Image src={item.image} alt="" fill sizes="120px" className={styles.image} />
              </div>
              <div className={styles.itemInfo}>
                <div><p className={styles.ref}>{item.ref}</p><h2>{item.name}</h2><p>Size {item.size}</p></div>
                <label>
                  <span>Quantity</span>
                  <select
                    value={item.quantity}
                    onChange={(event) => setQuantity(item.productId, item.size, Number(event.target.value))}
                  >
                    {Array.from({ length: Math.min(item.availableStock, 10) }, (_, index) => index + 1).map((quantity) => (
                      <option key={quantity} value={quantity}>{quantity}</option>
                    ))}
                  </select>
                </label>
                <button type="button" onClick={() => removeItem(item.productId, item.size)}>Remove</button>
              </div>
              <strong>{formatPrice(item.unitPriceCents * item.quantity)}</strong>
            </article>
          ))}
        </div>
        <aside className={styles.summary} aria-label="Order summary">
          <h2>Summary</h2>
          <div><span>Subtotal</span><strong>{formatPrice(subtotalCents)}</strong></div>
          <div><span>Delivery</span><span>Calculated later</span></div>
          <p>Final availability and prices are confirmed by the server during checkout.</p>
          <Link className={styles.checkout} href="/checkout">Proceed to checkout</Link>
        </aside>
      </div>
    </section>
  );
}
