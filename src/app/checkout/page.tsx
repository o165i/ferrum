import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = { title: "Checkout — FERRUM" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/checkout");

  return <CheckoutForm defaultName={session.user.name ?? ""} defaultEmail={session.user.email ?? ""} />;
}
