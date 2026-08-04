import type { ProductCategory, ProductSort, ProductsResponse } from "@/types/product";

export interface ProductsQuery {
  category?: ProductCategory;
  color?: string;
  search?: string;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}

export async function fetchProducts(query: ProductsQuery, signal?: AbortSignal): Promise<ProductsResponse> {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.color) params.set("color", query.color);
  if (query.search) params.set("search", query.search);
  if (query.sort) params.set("sort", query.sort);
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));

  const response = await fetch(`/api/products?${params.toString()}`, { headers: { Accept: "application/json" }, signal });
  if (!response.ok) throw new Error(`Products request failed with status ${response.status}`);
  return response.json() as Promise<ProductsResponse>;
}
