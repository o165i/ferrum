"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AddToBag } from "@/components/cart/AddToBag";
import { PRODUCT_CATEGORY_LABELS, type Product } from "@/types/product";
import styles from "./ProductDetails.module.css";

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);

export function ProductDetails({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const currentImage = product.images[selectedImage] ?? product.images[0];
  const hasPreviousImage = selectedImage > 0;
  const hasNextImage = selectedImage < product.images.length - 1;

  return (
    <article className={styles.product}>
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/catalog">Catalog</Link>
        <span aria-hidden="true">/</span>
        <Link href="/catalog">{PRODUCT_CATEGORY_LABELS[product.category]}</Link>
        <span aria-hidden="true">/</span>
        <span>{product.name}</span>
      </nav>

      <div className={styles.layout}>
        <div className={styles.gallery}>
          <div className={styles.mainImage}>
            {currentImage ? (
              <Image
                src={currentImage}
                alt={`${product.name}, view ${selectedImage + 1}`}
                fill
                priority
                sizes="(max-width: 800px) 100vw, 58vw"
              />
            ) : null}

            {hasPreviousImage ? (
              <button
                type="button"
                className={`${styles.galleryArrow} ${styles.galleryArrowPrevious}`}
                aria-label="Show previous product image"
                onClick={() => setSelectedImage((index) => Math.max(0, index - 1))}
              >
                <span aria-hidden="true">←</span>
              </button>
            ) : null}

            {hasNextImage ? (
              <button
                type="button"
                className={`${styles.galleryArrow} ${styles.galleryArrowNext}`}
                aria-label="Show next product image"
                onClick={() => setSelectedImage((index) => Math.min(product.images.length - 1, index + 1))}
              >
                <span aria-hidden="true">→</span>
              </button>
            ) : null}
          </div>

          <div className={styles.thumbnails} aria-label="Product images">
            {product.images.map((image, index) => (
              <button
                key={image}
                type="button"
                className={selectedImage === index ? styles.thumbnailActive : undefined}
                aria-label={`Show product image ${index + 1}`}
                aria-pressed={selectedImage === index}
                onClick={() => setSelectedImage(index)}
              >
                <Image src={image} alt="" fill sizes="96px" />
              </button>
            ))}
          </div>
        </div>

        <div className={styles.summary}>
          <p className={styles.eyebrow}>{PRODUCT_CATEGORY_LABELS[product.category]} / {product.ref}</p>
          <h1>{product.name}</h1>
          <p className={styles.price}>{formatPrice(product.saleCents ?? product.priceCents)}</p>
          <p className={styles.description}>{product.description}</p>

          <dl className={styles.specifications}>
            <div><dt>Category</dt><dd>{PRODUCT_CATEGORY_LABELS[product.category]}</dd></div>
            <div><dt>Color</dt><dd>{product.color}</dd></div>
            <div><dt>Composition</dt><dd>Not specified by supplier</dd></div>
            <div><dt>Available sizes</dt><dd>{product.sizes.join(" / ")}</dd></div>
          </dl>

          <div className={styles.purchase}>
            <p>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</p>
            <AddToBag product={product} />
          </div>

          <p className={styles.note}>Size labels follow the supplier chart: S (DE 36), M (DE 38), L (DE 40/42), XL (DE 44), XXL (DE 46), XXXL (DE 48).</p>
        </div>
      </div>
    </article>
  );
}
