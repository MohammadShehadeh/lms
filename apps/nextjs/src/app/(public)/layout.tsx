import type React from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1 pt-14">{children}</main>
      <Footer />
    </>
  );
}
