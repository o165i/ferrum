import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { authOptions } from "@/lib/auth";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Account — FERRUM" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/account");

  return (
    <section className={styles.account} aria-labelledby="account-title">
      <p className={styles.kicker}>Authenticated session</p>
      <h1 id="account-title" className={styles.title}>Account</h1>
      <dl className={styles.details}>
        <div className={styles.row}><dt>Name</dt><dd>{session.user.name || "Not provided"}</dd></div>
        <div className={styles.row}><dt>Email</dt><dd>{session.user.email}</dd></div>
        <div className={styles.row}><dt>Role</dt><dd>{session.user.role}</dd></div>
      </dl>
      <SignOutButton />
    </section>
  );
}
