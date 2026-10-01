import Link from "next/link";

export default function ProductNotFound() {
  return (
    <section style={{ minHeight: "70vh", display: "grid", placeItems: "center", textAlign: "center" }}>
      <div>
        <h1>Product not found</h1>
        <p>This product is unavailable or no longer active.</p>
        <Link className="primaryAction" href="/catalog">Return to catalog</Link>
      </div>
    </section>
  );
}
