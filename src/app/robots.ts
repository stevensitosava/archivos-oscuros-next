import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";

/** Allow the storefront; keep private/functional routes out of the index. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/biblioteca", "/checkout", "/carrito", "/compra/", "/acceso", "/registro", "/baja"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
