import Link from "next/link";
import styles from "./Navbar.module.css";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Catalog", href: "/catalog" },
] as const;

export function Navbar() {
  return (
    <header id="top" className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} aria-label="FERRUM home">FERRUM</Link>
        <nav className={styles.nav} aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => (
            <Link key={item.label} href={item.href} className={styles.navLink}>{item.label}</Link>
          ))}
        </nav>
        <button className={styles.bag} type="button" aria-label="Shopping bag, 0 items">
          <span className={styles.bagIcon} aria-hidden="true" />
          <span>0</span>
        </button>
      </div>
    </header>
  );
}
