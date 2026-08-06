import { z } from "zod";

export const productCategoryEnum = z.enum([
  "T_SHIRTS",
  "ZIP_HOODIES",
  "HOODIES",
  "JEANS",
  "SHORTS",
  "SWEATPANTS",
  "ACCESSORIES",
]);

export const catalogFilterEnum = z.enum([
  "all",
  "upperwear",
  "t-shirts",
  "zip-hoodies",
  "hoodies",
  "lowerwear",
  "pants",
  "jeans",
  "shorts",
  "sweatpants",
  "other",
]);

export const createProductSchema = z.object({
  ref: z.string().trim().min(2).max(20),
  name: z.string().trim().min(1).max(120),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(140)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase, digits and hyphens only"),
  category: productCategoryEnum,
  color: z.string().trim().min(1).max(40),
  priceCents: z.number().int().positive(),
  saleCents: z.number().int().positive().nullable().optional(),
  description: z.string().max(4000).optional().default(""),
  sizes: z.array(z.string().trim().min(1).max(10)).default([]),
  images: z.array(z.string().url()).default([]),
  stock: z.number().int().min(0).default(0),
  popularityScore: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const listProductsQuerySchema = z.object({
  category: productCategoryEnum.optional(),
  catalog: catalogFilterEnum.default("all"),
  color: z.string().trim().optional(),
  search: z.string().trim().max(100).optional(),
  sort: z.enum(["price_asc", "price_desc", "newest", "popular"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
}).refine((query) => !(query.category && query.catalog !== "all"), {
  message: "Use either category or catalog, not both",
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
