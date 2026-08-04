import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { QueryProvider } from "@/components/providers/QueryProvider";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "FERRUM — Drop 004",
  description: "FERRUM is an independent hard-goods label focused on material, small runs and repairable construction.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
