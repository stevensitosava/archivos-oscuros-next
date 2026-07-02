import type { Metadata } from "next";
import { Suspense } from "react";
import CompraExitoClient from "./CompraExitoClient";

export const metadata: Metadata = { title: "Compra confirmada", robots: { index: false } };

export default function CompraExito() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <CompraExitoClient />
    </Suspense>
  );
}
