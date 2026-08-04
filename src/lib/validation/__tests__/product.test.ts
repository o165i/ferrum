import { describe, expect, it } from "vitest";
import { createProductSchema, listProductsQuerySchema } from "@/lib/validation/product";

describe("createProductSchema", () => {
  const valid = {
    ref: "FR-100",
    name: "TEST JACKET",
    slug: "test-jacket",
    category: "OUTERWEAR" as const,
    color: "BLACK",
    priceCents: 10000,
  };

  it("accepts a minimal valid product", () => {
    const result = createProductSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects a negative price", () => {
    const result = createProductSchema.safeParse({ ...valid, priceCents: -500 });
    expect(result.success).toBe(false);
  });

  it("rejects an uppercase slug", () => {
    const result = createProductSchema.safeParse({ ...valid, slug: "Test-Jacket" });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown category", () => {
    const result = createProductSchema.safeParse({ ...valid, category: "SHOES" });
    expect(result.success).toBe(false);
  });
});

describe("listProductsQuerySchema", () => {
  it("applies defaults when nothing is provided", () => {
    const result = listProductsQuerySchema.parse({});
    expect(result).toEqual({ sort: "newest", page: 1, pageSize: 20 });
  });

  it("coerces page/pageSize from query string values", () => {
    const result = listProductsQuerySchema.parse({ page: "2", pageSize: "10" });
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(10);
  });

  it("rejects pageSize above the max", () => {
    const result = listProductsQuerySchema.safeParse({ pageSize: "500" });
    expect(result.success).toBe(false);
  });

  it("accepts popular sorting", () => {
    const result = listProductsQuerySchema.parse({ sort: "popular" });
    expect(result.sort).toBe("popular");
  });
});
