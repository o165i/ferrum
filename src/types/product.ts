export type ProductCategory = "OUTERWEAR" | "KNITWEAR" | "DENIM" | "TOPS" | "ACCESSORIES";

export interface Product {
  id: number;
  ref: string;
  name: string;
  category: ProductCategory;
  color: string;
  price: number;
  sale: number | null;
  primaryImage: string;
  alternateImage: string;
}
