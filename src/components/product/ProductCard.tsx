import Image from "next/image";
import type { Product } from "@/types/product";
import styles from "./ProductCard.module.css";

const FALLBACK_IMAGE = "https://picsum.photos/seed/ferrum-placeholder/900/1150";
const formatPrice = (cents: number) => new Intl.NumberFormat("en-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(cents / 100);

export function ProductCard({ product }: { product: Product }) {
  const primaryImage = product.images[0] ?? FALLBACK_IMAGE;
  const alternateImage = product.images[1] ?? primaryImage;

  return (
    <article className={styles.card}>
      <div className={styles.imageFrame}>
        <Image src={primaryImage} alt={product.name} fill sizes="(max-width: 680px) 50vw, 25vw" className={`${styles.image} ${styles.primaryImage}`} />
        <Image src={alternateImage} alt="" fill sizes="(max-width: 680px) 50vw, 25vw" className={`${styles.image} ${styles.alternateImage}`} />
        {product.saleCents !== null && <span className={styles.saleBadge}>SALE</span>}
        {product.stock === 0 && <span className={styles.stockBadge}>OUT OF STOCK</span>}
        <div className={styles.manifest}><span>{product.ref}</span><span>{product.color}</span></div>
      </div>
      <div className={styles.info}>
        <div><h3>{product.name}</h3><p>{product.category}</p></div>
        <div className={styles.prices}>{product.saleCents !== null ? <><del>{formatPrice(product.priceCents)}</del><strong>{formatPrice(product.saleCents)}</strong></> : <span>{formatPrice(product.priceCents)}</span>}</div>
      </div>
    </article>
  );
}
