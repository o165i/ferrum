import { z } from "zod";

const orderItemSchema = z.object({
  productId: z.string().trim().min(1).max(100),
  size: z.string().trim().min(1).max(20),
  quantity: z.number().int().min(1).max(10),
});

export const createOrderSchema = z
  .object({
    contactName: z.string().trim().min(2).max(100),
    contactEmail: z.string().trim().toLowerCase().email().max(254),
    phone: z.string().trim().min(6).max(30),
    addressLine1: z.string().trim().min(3).max(160),
    addressLine2: z.string().trim().max(160).optional().default(""),
    city: z.string().trim().min(2).max(100),
    postalCode: z.string().trim().min(2).max(20),
    country: z.string().trim().min(2).max(80),
    // PayPal orders must only be created after a verified server-side capture.
    // Until that flow is connected, this endpoint accepts bank transfers only.
    paymentMethod: z.literal("BANK_TRANSFER"),
    items: z.array(orderItemSchema).min(1).max(30),
  })
  .superRefine((data, context) => {
    const uniqueItems = new Set<string>();
    data.items.forEach((item, index) => {
      const key = `${item.productId}:${item.size.toUpperCase()}`;
      if (uniqueItems.has(key)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items", index],
          message: "Duplicate product and size",
        });
      }
      uniqueItems.add(key);
    });
  });

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED"]),
});
