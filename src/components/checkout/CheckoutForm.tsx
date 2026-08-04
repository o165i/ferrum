"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import type { CreateOrderResponse } from "@/types/cart";
import styles from "./CheckoutForm.module.css";

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-DE", { style: "currency", currency: "EUR" }).format(cents / 100);

export function CheckoutForm({ defaultName, defaultEmail }: { defaultName: string; defaultEmail: string }) {
  const router = useRouter();
  const { items, subtotalCents, hydrated, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: form.get("contactName"),
          contactEmail: form.get("contactEmail"),
          phone: form.get("phone"),
          addressLine1: form.get("addressLine1"),
          addressLine2: form.get("addressLine2"),
          city: form.get("city"),
          postalCode: form.get("postalCode"),
          country: form.get("country"),
          paymentMethod: form.get("paymentMethod"),
          items: items.map((item) => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
          })),
        }),
      });
      const data = (await response.json()) as CreateOrderResponse & { error?: { message?: string } };
      if (!response.ok) {
        setError(data.error?.message ?? "The order could not be created.");
        return;
      }

      clearCart();
      router.push(`/checkout/success?order=${encodeURIComponent(data.order.orderNumber)}`);
    } catch {
      setError("The checkout service is temporarily unavailable. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!hydrated) return <section className={styles.page}><p>Loading checkout…</p></section>;
  if (items.length === 0) {
    return (
      <section className={styles.empty}>
        <h1>Your bag is empty</h1>
        <Link className="primaryAction" href="/catalog">Open catalog</Link>
      </section>
    );
  }

  return (
    <section className={styles.page} aria-labelledby="checkout-title">
      <header><p className={styles.kicker}>Secure order creation</p><h1 id="checkout-title">Checkout</h1></header>
      <form className={styles.layout} onSubmit={handleSubmit}>
        <div className={styles.formSections}>
          <fieldset><legend><span>01</span> Contact</legend><div className={styles.grid}>
            <label><span>Full name</span><input name="contactName" defaultValue={defaultName} autoComplete="name" required minLength={2} maxLength={100} /></label>
            <label><span>Email</span><input name="contactEmail" defaultValue={defaultEmail} type="email" autoComplete="email" required /></label>
            <label className={styles.full}><span>Phone</span><input name="phone" type="tel" autoComplete="tel" required minLength={6} maxLength={30} /></label>
          </div></fieldset>
          <fieldset><legend><span>02</span> Delivery</legend><div className={styles.grid}>
            <label className={styles.full}><span>Address</span><input name="addressLine1" autoComplete="address-line1" required /></label>
            <label className={styles.full}><span>Apartment / unit (optional)</span><input name="addressLine2" autoComplete="address-line2" /></label>
            <label><span>City</span><input name="city" autoComplete="address-level2" required /></label>
            <label><span>Postal code</span><input name="postalCode" autoComplete="postal-code" required /></label>
            <label className={styles.full}><span>Country</span><input name="country" defaultValue="Germany" autoComplete="country-name" required /></label>
          </div></fieldset>
          <fieldset><legend><span>03</span> Payment</legend><div className={styles.paymentChoices}>
            <label><input type="radio" name="paymentMethod" value="BANK_TRANSFER" defaultChecked /><span><strong>Bank transfer</strong><small>Instructions will follow after confirmation.</small></span></label>
            <label><input type="radio" name="paymentMethod" value="CASH_ON_DELIVERY" /><span><strong>Cash on delivery</strong><small>No online charge is made.</small></span></label>
          </div></fieldset>
        </div>
        <aside className={styles.summary}>
          <h2>04 / Review</h2>
          <ul>{items.map((item) => <li key={`${item.productId}:${item.size}`}><span>{item.name} / {item.size} × {item.quantity}</span><strong>{formatPrice(item.unitPriceCents * item.quantity)}</strong></li>)}</ul>
          <div className={styles.total}><span>Total</span><strong>{formatPrice(subtotalCents)}</strong></div>
          <p>No money will be charged. Availability and price are rechecked when you place the order.</p>
          {error ? <p className={styles.error} role="alert">{error}</p> : null}
          <button type="submit" disabled={submitting}>{submitting ? "Creating order…" : "Place order"}</button>
        </aside>
      </form>
    </section>
  );
}
