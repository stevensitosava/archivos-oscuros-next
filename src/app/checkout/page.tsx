import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = { title: "Pago", robots: { index: false } };

export default function CheckoutPage() {
  return <CheckoutClient />;
}
