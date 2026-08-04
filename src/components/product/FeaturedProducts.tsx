"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchProducts } from "@/lib/api/products";
import { ProductCard } from "./ProductCard";
import styles from "@/app/page.module.css";

type FeaturedMode = "newest" | "popular";

export function FeaturedProducts() {
  const [mode, setMode] = useState<FeaturedMode>("newest");
  const query = useQuery({
    queryKey: ["products", "featured", mode],
    queryFn: ({ signal }) => fetchProducts({ sort: mode, page: 1, pageSize: 4 }, signal),
  });

  return (
    <section id="featured" className={styles.featured} aria-labelledby="featured-title">
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionKicker}>LIVE FROM /API/PRODUCTS</p>
          <h2 id="featured-title" className={styles.sectionTitle}>{mode === "newest" ? "Recent" : "Popular"}</h2>
        </div>
        <div className={styles.modeTabs} role="group" aria-label="Product selection">
          <button type="button" className={mode === "newest" ? styles.modeActive : ""} onClick={() => setMode("newest")}>Recent</button>
          <button type="button" className={mode === "popular" ? styles.modeActive : ""} onClick={() => setMode("popular")}>Popular</button>
        </div>
      </div>

      {query.isPending && <div className={styles.status}>Loading products…</div>}
      {query.isError && <div className={styles.status}><span>Products are unavailable.</span><button type="button" onClick={() => query.refetch()}>Try again</button></div>}
      {query.data?.items.length === 0 && <div className={styles.status}>No active products found.</div>}
      {query.data && query.data.items.length > 0 && <div className={styles.productGrid}>{query.data.items.map((product) => <ProductCard key={product.id} product={product} />)}</div>}
    </section>
  );
}
