import type { MetadataRoute } from "next";
import { getAllBooks } from "@/lib/books-data";
import { SITE_URL } from "@/lib/env";

/** Dynamic sitemap — static pages + every published book. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const books = await getAllBooks();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/catalogo`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/gratis`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/aviso-legal`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terminos`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const bookRoutes: MetadataRoute.Sitemap = books.map((b) => {
    // Absolute cover URL for the image-sitemap extension (helps image search).
    const img = b.cover.image
      ? b.cover.image.startsWith("http")
        ? b.cover.image
        : `${SITE_URL}${b.cover.image}`
      : undefined;
    return {
      url: `${SITE_URL}/libro/${b.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      ...(img ? { images: [img] } : {}),
    };
  });

  return [...staticRoutes, ...bookRoutes];
}
