import { describe, expect, it } from "vitest";
import { createOrderSchema, updateOrderStatusSchema } from "@/lib/validation/order";

const validOrder = {
  contactName: "Alex Example",
  contactEmail: "ALEX@EXAMPLE.COM",
  phone: "+49 123 456789",
  addressLine1: "Example Street 12",
  addressLine2: "",
  city: "Berlin",
  postalCode: "10115",
  country: "Germany",
  paymentMethod: "BANK_TRANSFER" as const,
  items: [{ productId: "product-1", size: "M", quantity: 2 }],
};

describe("createOrderSchema", () => {
  it("normalizes the contact email", () => {
    expect(createOrderSchema.parse(validOrder).contactEmail).toBe("alex@example.com");
  });

  it("rejects an empty cart", () => {
    expect(() => createOrderSchema.parse({ ...validOrder, items: [] })).toThrow();
  });

  it("rejects duplicate product and size rows", () => {
    expect(() =>
      createOrderSchema.parse({
        ...validOrder,
        items: [validOrder.items[0], { ...validOrder.items[0] }],
      })
    ).toThrow();
  });

  it("rejects unsupported payment methods", () => {
    expect(() => createOrderSchema.parse({ ...validOrder, paymentMethod: "CARD" })).toThrow();
  });

  it("rejects cash on delivery", () => {
    expect(() => createOrderSchema.parse({ ...validOrder, paymentMethod: "CASH_ON_DELIVERY" })).toThrow();
  });

  it("does not create an unpaid PayPal order through the bank transfer endpoint", () => {
    expect(() => createOrderSchema.parse({ ...validOrder, paymentMethod: "PAYPAL" })).toThrow();
  });
});

describe("updateOrderStatusSchema", () => {
  it("accepts admin-managed order states", () => {
    expect(updateOrderStatusSchema.parse({ status: "CONFIRMED" }).status).toBe("CONFIRMED");
    expect(updateOrderStatusSchema.parse({ status: "CANCELLED" }).status).toBe("CANCELLED");
  });

  it("does not allow moving an order back to pending", () => {
    expect(() => updateOrderStatusSchema.parse({ status: "PENDING" })).toThrow();
  });
});
