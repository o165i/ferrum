"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import styles from "./AuthForm.module.css";

type ApiError = { error?: { message?: string } };

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");

    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, ...(name ? { name } : {}) }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as ApiError;
        setError(body.error?.message || "Could not create the account.");
        setIsSubmitting(false);
        return;
      }

      const signInResult = await signIn("credentials", { email, password, redirect: false });
      if (!signInResult?.ok) {
        router.replace("/login");
        return;
      }

      router.replace("/account");
      router.refresh();
    } catch {
      setError("Registration is temporarily unavailable. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <section className={styles.page} aria-labelledby="register-title">
      <p className={styles.kicker}>New account</p>
      <h1 id="register-title" className={styles.title}>Register</h1>
      <p className={styles.intro}>Create an account for future checkout and order data.</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span className={styles.label}>Name (optional)</span>
          <input className={styles.input} name="name" type="text" autoComplete="name" maxLength={80} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Email</span>
          <input className={styles.input} name="email" type="email" autoComplete="email" required />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Password</span>
          <input className={styles.input} name="password" type="password" autoComplete="new-password" minLength={8} maxLength={72} required />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Repeat password</span>
          <input className={styles.input} name="confirmation" type="password" autoComplete="new-password" minLength={8} maxLength={72} required />
        </label>
        {error ? <p className={styles.error} role="alert">{error}</p> : null}
        <button className={styles.submit} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className={styles.switch}>Already registered? <Link href="/login">Sign in</Link></p>
    </section>
  );
}
