"use client";

import { useState, type CSSProperties } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/api/products";
import type { CatalogFilter } from "@/types/product";
import { ProductCard } from "./ProductCard";
import styles from "@/app/catalog/page.module.css";

type CatalogNode = { id: CatalogFilter; label: string; children?: CatalogNode[] };

const CATALOG_TREE: CatalogNode[] = [
  {
    id: "upperwear",
    label: "Upperwear",
    children: [
      { id: "t-shirts", label: "T-Shirts" },
      { id: "zip-hoodies", label: "Zip Hoodies" },
      { id: "hoodies", label: "Hoodies" },
    ],
  },
  {
    id: "lowerwear",
    label: "Lowerwear",
    children: [
      {
        id: "pants",
        label: "Pants",
        children: [
          { id: "jeans", label: "Jeans" },
          { id: "shorts", label: "Shorts" },
          { id: "sweatpants", label: "Sweatpants" },
        ],
      },
    ],
  },
  { id: "other", label: "Other" },
];

export function CatalogProducts() {
  const [filter, setFilter] = useState<CatalogFilter>("all");
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["products", "catalog", filter, page],
    queryFn: ({ signal }) => fetchProducts({ catalog: filter, sort: "newest", page, pageSize: 8 }, signal),
  });

  function selectFilter(nextFilter: CatalogFilter) {
    setFilter(nextFilter);
    setPage(1);
  }

  function renderFilter(node: CatalogNode, depth = 0) {
    return (
      <div className={styles.filterGroup} key={node.id}>
        <button
          type="button"
          className={filter === node.id ? styles.filterActive : undefined}
          style={{ "--filter-depth": depth } as CSSProperties}
          aria-pressed={filter === node.id}
          onClick={() => selectFilter(node.id)}
        >
          {node.label}
        </button>
        {node.children?.map((child) => renderFilter(child, depth + 1))}
      </div>
    );
  }

  return (
    <div className={styles.catalogBody}>
      <nav className={styles.filters} aria-label="Product categories">
        {renderFilter({ id: "all", label: "All" })}
        {CATALOG_TREE.map((section) => renderFilter(section))}
      </nav>

      <div className={styles.results} aria-live="polite">
        {query.isPending ? <div className={styles.status}>Loading catalog…</div> : null}
        {query.isError ? <div className={styles.status}><span>Catalog is unavailable.</span><button type="button" onClick={() => query.refetch()}>Try again</button></div> : null}
        {query.data && query.data.items.length === 0 ? <div className={styles.status}>No active products found.</div> : null}
        {query.data && query.data.items.length > 0 ? (
          <>
            <p className={styles.count}>{query.data.pagination.total} ITEMS</p>
            <div className={styles.grid}>{query.data.items.map((product) => <ProductCard key={product.id} product={product} />)}</div>
            {query.data.pagination.totalPages > 1 ? (
              <nav className={styles.pagination} aria-label="Catalog pages">
                {Array.from({ length: query.data.pagination.totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <button key={pageNumber} type="button" aria-current={page === pageNumber ? "page" : undefined} onClick={() => setPage(pageNumber)}>{pageNumber}</button>
                ))}
              </nav>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
