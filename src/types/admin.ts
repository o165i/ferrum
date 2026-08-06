import type { Product, ProductCategory } from "@/types/product";

export interface AdminProduct extends Product {
  category: ProductCategory;
}

export interface AdminOrderItem {
  id: string;
  productRef: string;
  productName: string;
  size: string;
  quantity: number;
  lineTotalCents: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  paymentMethod: "CASH_ON_DELIVERY" | "BANK_TRANSFER" | "PAYPAL";
  contactName: string;
  contactEmail: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postalCode: string;
  country: string;
  totalCents: number;
  createdAt: string;
  items: AdminOrderItem[];
}
