"use client";

export default function ProductError({ reset }: { reset: () => void }) {
  return (
    <section role="alert" style={{ minHeight: "70vh", display: "grid", placeItems: "center", textAlign: "center" }}>
      <div>
        <h1>Product unavailable</h1>
        <p>We could not load this product right now.</p>
        <button className="primaryAction" type="button" onClick={reset}>Try again</button>
      </div>
    </section>
  );
}
