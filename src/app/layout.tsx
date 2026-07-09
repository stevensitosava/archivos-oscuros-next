import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CartProvider } from "@/store/cart";
import { EntitlementsProvider } from "@/components/EntitlementsProvider";
import { BooksProvider } from "@/components/BooksProvider";
import { LocaleProvider } from "@/components/LocaleProvider";
import SignupTracker from "@/components/SignupTracker";
import Shell from "@/components/Shell";
import { getAllBooks } from "@/lib/books-data";
import { SITE_URL, isClerkConfigured } from "@/lib/env";
import { safeJsonLd } from "@/lib/jsonld";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

const DESCRIPTION =
  "Librería digital de estoicismo, historia y filosofía de guerreros. Ebooks descargables al instante para forjar el carácter.";
const TITLE = "Archivos Oscuros · Ebooks de estoicismo, historia y guerreros";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s · Archivos Oscuros" },
  description: DESCRIPTION,
  applicationName: "Archivos Oscuros",
  authors: [{ name: "Archivos Oscuros" }],
  keywords: [
    "ebooks", "estoicismo", "filosofía", "guerreros", "historia", "samurái",
    "vikingos", "esparta", "Marco Aurelio", "bushido", "libros descargables", "español",
  ],
  manifest: "/site.webmanifest",
  icons: { icon: "/sigil.svg" },
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    siteName: "Archivos Oscuros",
    locale: "es_ES",
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Archivos Oscuros" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description:
      "Estoicismo, historia y códigos de guerreros. Sabiduría dura para forjar el carácter.",
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = { themeColor: "#010101" };

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "OnlineStore"],
      "@id": `${SITE_URL}/#org`,
      name: "Archivos Oscuros",
      url: `${SITE_URL}/`,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630 },
      image: `${SITE_URL}/og-image.jpg`,
      description:
        "Librería digital en español de ebooks sobre estoicismo, historia militar y los códigos de los grandes guerreros.",
      slogan: "Sabiduría dura para forjar el carácter.",
      inLanguage: "es",
      areaServed: "Worldwide",
      knowsAbout: [
        "Estoicismo",
        "Marco Aurelio",
        "Séneca",
        "Filosofía del guerrero",
        "Bushido",
        "Samuráis",
        "Vikingos",
        "Esparta",
        "Legiones romanas",
        "Autodisciplina",
        "Resiliencia",
        "Desarrollo del carácter",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: "Archivos Oscuros",
      description: DESCRIPTION,
      inLanguage: "es",
      publisher: { "@id": `${SITE_URL}/#org` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/catalogo?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const books = await getAllBooks();
  const inner = (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(JSON_LD) }}
      />
      <LocaleProvider>
        <BooksProvider books={books}>
          <CartProvider>
            <EntitlementsProvider>
              {/* Shell renders storefront chrome (grain + nav + footer + cookie
                  banner) on public routes and a bare passthrough on /admin. */}
              <Shell>{children}</Shell>
            </EntitlementsProvider>
          </CartProvider>
        </BooksProvider>
      </LocaleProvider>
      <Analytics />
      <SpeedInsights />
    </>
  );

  return (
    <html lang="es" className={poppins.variable}>
      {/* ClerkProvider lives INSIDE <body> (Clerk requirement); rendered only
          when Clerk keys are present so the app still runs in demo mode. */}
      <body>
        {isClerkConfigured ? (
          <ClerkProvider>
            {inner}
            {/* Needs Clerk context — that's why it's inside the provider. */}
            <SignupTracker />
          </ClerkProvider>
        ) : (
          inner
        )}
      </body>
    </html>
  );
}
