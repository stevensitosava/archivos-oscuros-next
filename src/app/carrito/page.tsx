import type { Metadata } from "next";
import CarritoClient from "./CarritoClient";

export const metadata: Metadata = {
  title: "Carrito",
  robots: { index: false, follow: true },
};

export default function CarritoPage() {
  return <CarritoClient />;
}
