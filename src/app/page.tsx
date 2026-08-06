import Image from "next/image";
import Link from "next/link";
import { FeaturedProducts } from "@/components/product/FeaturedProducts";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <section className={styles.hero} aria-labelledby="hero-title">
        <Image src="https://picsum.photos/seed/ferrum-hero/1600/1400" alt="Model wearing the FERRUM collection" fill priority sizes="100vw" className={styles.heroImage} />
        <div className={styles.heroShade} />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>COMMERCE API / DEMO</p>
          <h1 id="hero-title" className={styles.heroTitle}>FERRUM</h1>
          <div className={styles.heroActions}><Link href="/catalog" className="primaryAction">Open catalog</Link><span className={styles.runNote}>API-connected storefront</span></div>
        </div>
      </section>
      <FeaturedProducts />
    </>
  );
}
