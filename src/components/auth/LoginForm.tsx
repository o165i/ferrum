"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import styles from "./AuthForm.module.css";

function safeCallbackUrl(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    try {
      const result = await signIn("credentials", {
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
        redirect: false,
      });

      if (!result?.ok) {
        setError("Email or password is incorrect.");
        setIsSubmitting(false);
        return;
      }

      router.replace(safeCallbackUrl(searchParams.get("callbackUrl")));
      router.refresh();
    } catch {
      setError("Sign in is temporarily unavailable. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <section className={styles.page} aria-labelledby="login-title">
      <p className={styles.kicker}>Account access</p>
      <h1 id="login-title" className={styles.title}>Sign in</h1>
      <p className={styles.intro}>Use the email and password connected to your account.</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span className={styles.label}>Email</span>
          <input className={styles.input} name="email" type="email" autoComplete="email" required />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Password</span>
          <input className={styles.input} name="password" type="password" autoComplete="current-password" required />
        </label>
        {error ? <p className={styles.error} role="alert">{error}</p> : null}
        <button className={styles.submit} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className={styles.switch}>No account yet? <Link href="/register">Create one</Link></p>
    </section>
  );
}
