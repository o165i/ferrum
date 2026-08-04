import { z } from "zod";

export const productCategoryEnum = z.enum([
  "OUTERWEAR",
  "KNITWEAR",
  "DENIM",
  "TOPS",
  "ACCESSORIES",
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
  color: z.string().trim().optional(),
  search: z.string().trim().max(100).optional(),
  sort: z.enum(["price_asc", "price_desc", "newest", "popular"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
