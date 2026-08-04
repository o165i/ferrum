import type { Metadata } from "next";
import { ProductCard } from "@/components/product/ProductCard";
import { PRODUCTS } from "@/constants/mockData";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Catalog — FERRUM",
  description: "The complete FERRUM product archive.",
};

export default function CatalogPage() {
  return (
    <section className={styles.catalog} aria-labelledby="catalog-title">
      <header className={styles.header}>
        <div>
          <p>DROP 004 / FULL ARCHIVE</p>
          <h1 id="catalog-title">Catalog</h1>
        </div>
        <span>{PRODUCTS.length} ITEMS</span>
      </header>
      <div className={styles.divider} />
      <div className={styles.grid}>
        {PRODUCTS.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}
