"use client";

import { signOut } from "next-auth/react";
import styles from "./AuthForm.module.css";

export function SignOutButton() {
  return <button className={styles.submit} type="button" onClick={() => signOut({ callbackUrl: "/" })}>Sign out</button>;
}
