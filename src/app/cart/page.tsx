import type { Metadata } from "next";
import { CartPage } from "@/components/cart/CartPage";

export const metadata: Metadata = { title: "Bag — FERRUM" };

export default function Page() {
  return <CartPage />;
}
