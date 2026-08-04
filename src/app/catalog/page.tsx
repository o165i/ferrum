import type { Metadata } from "next";
import { CatalogProducts } from "@/components/product/CatalogProducts";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Catalog — FERRUM", description: "The complete product catalog loaded from the commerce API." };

export default function CatalogPage() {
  return (
    <section className={styles.catalog} aria-labelledby="catalog-title">
      <header className={styles.header}><div><p>LIVE /API/PRODUCTS</p><h1 id="catalog-title">Catalog</h1></div></header>
      <div className={styles.divider} />
      <CatalogProducts />
    </section>
  );
}
