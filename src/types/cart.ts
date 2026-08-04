export interface CartItem {
  productId: string;
  ref: string;
  name: string;
  image: string;
  size: string;
  unitPriceCents: number;
  quantity: number;
  availableStock: number;
}

export interface CreateOrderResponse {
  order: {
    id: string;
    orderNumber: string;
    status: "PENDING" | "CONFIRMED" | "CANCELLED";
    totalCents: number;
  };
}
