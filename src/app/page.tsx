import Image from "next/image";
import { ProductCard } from "@/components/product/ProductCard";
import { PRODUCTS } from "@/constants/mockData";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <section className={styles.hero} aria-labelledby="hero-title">
        <Image
          src="https://picsum.photos/seed/ferrum-hero/1600/1400"
          alt="Model wearing the FERRUM FW26 collection"
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroShade} />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>DROP 004 — FW26</p>
          <h1 id="hero-title" className={styles.heroTitle}>FERRUM</h1>
          <div className={styles.heroActions}>
            <a href="/catalog" className="primaryAction">Enter archive</a>
            <span className={styles.runNote}>12 pieces · limited run</span>
          </div>
        </div>
      </section>

      <section id="recent" className={styles.featured} aria-labelledby="recent-title">
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionKicker}>LATEST ARRIVALS / 004</p>
            <h2 id="recent-title" className={styles.sectionTitle}>Recent</h2>
          </div>
          <a href="/catalog" className={styles.viewAll}>View catalog <span aria-hidden="true">↗</span></a>
        </div>
        <div className={styles.productGrid}>
          {PRODUCTS.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

    </>
  );
}
