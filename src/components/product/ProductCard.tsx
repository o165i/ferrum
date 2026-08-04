import Image from "next/image";
import type { Product } from "@/types/product";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.imageFrame}>
        <Image
          src={product.primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 680px) 50vw, 25vw"
          className={`${styles.image} ${styles.primaryImage}`}
        />
        <Image
          src={product.alternateImage}
          alt=""
          fill
          sizes="(max-width: 680px) 50vw, 25vw"
          className={`${styles.image} ${styles.alternateImage}`}
        />
        {product.sale !== null && <span className={styles.saleBadge}>SALE</span>}
        <div className={styles.manifest}>
          <span>{product.ref}</span>
          <span>{product.color}</span>
        </div>
      </div>
      <div className={styles.info}>
        <div>
          <h3>{product.name}</h3>
          <p>{product.category}</p>
        </div>
        <div className={styles.prices}>
          {product.sale !== null ? (
            <>
              <del>€{product.price}</del>
              <strong>€{product.sale}</strong>
            </>
          ) : (
            <span>€{product.price}</span>
          )}
        </div>
      </div>
    </article>
  );
}
