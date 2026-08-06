export const PRODUCT_CATEGORIES = [
  "T_SHIRTS",
  "ZIP_HOODIES",
  "HOODIES",
  "JEANS",
  "SHORTS",
  "SWEATPANTS",
  "ACCESSORIES",
] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  T_SHIRTS: "T-Shirts",
  ZIP_HOODIES: "Zip Hoodies",
  HOODIES: "Hoodies",
  JEANS: "Jeans",
  SHORTS: "Shorts",
  SWEATPANTS: "Sweatpants",
  ACCESSORIES: "Accessories",
};

export const CATALOG_FILTERS = {
  all: PRODUCT_CATEGORIES,
  upperwear: ["T_SHIRTS", "ZIP_HOODIES", "HOODIES"],
  "t-shirts": ["T_SHIRTS"],
  "zip-hoodies": ["ZIP_HOODIES"],
  hoodies: ["HOODIES"],
  lowerwear: ["JEANS", "SHORTS", "SWEATPANTS"],
  pants: ["JEANS", "SHORTS", "SWEATPANTS"],
  jeans: ["JEANS"],
  shorts: ["SHORTS"],
  sweatpants: ["SWEATPANTS"],
  other: ["ACCESSORIES"],
} as const satisfies Record<string, readonly ProductCategory[]>;

export type CatalogFilter = keyof typeof CATALOG_FILTERS;
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
