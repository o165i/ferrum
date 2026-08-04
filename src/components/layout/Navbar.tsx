"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useCart } from "@/components/cart/CartProvider";
import styles from "./Navbar.module.css";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Catalog", href: "/catalog" },
] as const;

export function Navbar() {
  const { data: session, status } = useSession();
  const { itemCount, hydrated } = useCart();
  const accountLabel = session?.user.name || session?.user.email || "Account";

  return (
    <header id="top" className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} aria-label="FERRUM home">FERRUM</Link>
        <nav className={styles.nav} aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => (
            <Link key={item.label} href={item.href} className={styles.navLink}>{item.label}</Link>
          ))}
        </nav>
        <div className={styles.actions}>
          {status === "authenticated" ? (
            <>
              {session.user.role === "ADMIN" ? <Link href="/admin" className={styles.textButton}>Admin</Link> : null}
              <Link href="/account" className={styles.accountLink} title={accountLabel}>
                {accountLabel}
              </Link>
              <button className={styles.textButton} type="button" onClick={() => signOut({ callbackUrl: "/" })}>
                Sign out
              </button>
            </>
          ) : status === "unauthenticated" ? (
            <Link href="/login" className={styles.accountLink}>Sign in</Link>
          ) : (
            <span className={styles.sessionPlaceholder} aria-hidden="true" />
          )}
          <Link className={styles.bag} href="/cart" aria-label={`Shopping bag, ${hydrated ? itemCount : 0} items`}>
            <span className={styles.bagIcon} aria-hidden="true" />
            <span>{hydrated ? itemCount : 0}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
