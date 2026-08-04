export const PRODUCT_CATEGORIES = ["OUTERWEAR", "KNITWEAR", "DENIM", "TOPS", "ACCESSORIES"] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
export type ProductSort = "newest" | "popular" | "price_asc" | "price_desc";

export interface Product {
  id: string;
  ref: string;
  name: string;
  slug: string;
  category: ProductCategory;
  color: string;
  priceCents: number;
  saleCents: number | null;
  description: string;
  sizes: string[];
  images: string[];
  stock: number;
  popularityScore: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  items: Product[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}
