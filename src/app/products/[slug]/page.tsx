import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/product/ProductDetails";
import { getActiveProductBySlug } from "@/lib/products";
import type { Product } from "@/types/product";

type ProductPageProps = { params: { slug: string } };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getActiveProductBySlug(params.slug);

  if (!product) return { title: "Product not found — FERRUM" };

  return {
    title: `${product.name} — FERRUM`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const record = await getActiveProductBySlug(params.slug);
  if (!record) notFound();

  const product: Product = {
    ...record,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };

  return <ProductDetails product={product} />;
}
