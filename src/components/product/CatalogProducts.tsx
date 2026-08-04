"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/api/products";
import { ProductCard } from "./ProductCard";
import styles from "@/app/catalog/page.module.css";

export function CatalogProducts() {
  const query = useQuery({
    queryKey: ["products", "catalog"],
    queryFn: ({ signal }) => fetchProducts({ sort: "newest", page: 1, pageSize: 50 }, signal),
  });

  if (query.isPending) return <div className={styles.status}>Loading catalog…</div>;
  if (query.isError) return <div className={styles.status}><span>Catalog is unavailable.</span><button type="button" onClick={() => query.refetch()}>Try again</button></div>;
  if (query.data.items.length === 0) return <div className={styles.status}>No active products found.</div>;

  return (
    <>
      <p className={styles.count}>{query.data.pagination.total} ITEMS</p>
      <div className={styles.grid}>{query.data.items.map((product) => <ProductCard key={product.id} product={product} />)}</div>
    </>
  );
}
