import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span>© 2026 FERRUM</span>
        <span>Independent hard-goods label</span>
        <a href="#top" className={styles.backToTop}>Back to top ↑</a>
      </div>
    </footer>
  );
}
