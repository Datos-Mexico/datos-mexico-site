import type { Metadata } from "next";
import { Source_Serif_4, Inter, JetBrains_Mono } from "next/font/google";
import { brand } from "@/lib/design-tokens";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const siteUrl = "https://datosmexico.org";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${brand.name} — ${brand.tagline}`,
    template: `%s · ${brand.name}`,
  },
  description: brand.tagline,
  applicationName: brand.name,
  keywords: [
    "datos México",
    "observatorio",
    "INEGI",
    "CONSAR",
    "Banxico",
    "microdatos",
    "ENIGH",
    "datos públicos",
    "transparencia",
    "ITAM",
  ],
  authors: [{ name: brand.name }],
  creator: brand.name,
  publisher: brand.name,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/android-chrome-512x512-v2.png", sizes: "512x512", type: "image/png" },
      { url: "/android-chrome-192x192-v2.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-144x144-v2.png", sizes: "144x144", type: "image/png" },
      { url: "/favicon-96x96-v2.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon-48x48-v2.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-32x32-v2.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16-v2.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-v2.ico" },
    ],
    apple: [{ url: "/apple-touch-icon-v2.png", sizes: "180x180", type: "image/png" }],
    other: [
      { rel: "mask-icon", url: "/brand/logo-mono-black.svg", color: "#15803D" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: siteUrl,
    siteName: brand.name,
    title: `${brand.name} — ${brand.tagline}`,
    description: brand.tagline,
    images: [
      {
        url: "/og/og-default.png",
        width: 1200,
        height: 630,
        alt: `${brand.name} — Observatorio de datos de México`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.name} — ${brand.tagline}`,
    description: brand.tagline,
    images: ["/og/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: brand.name,
  alternateName: "Datos ITAM",
  url: siteUrl,
  logo: `${siteUrl}/android-chrome-512x512-v2.png`,
  description:
    "Observatorio independiente de datos públicos de México, formado por estudiantes, egresados y colaboradores del ITAM.",
  foundingLocation: {
    "@type": "Place",
    name: "Ciudad de México, México",
  },
  knowsLanguage: "es-MX",
  sameAs: ["https://datos-itam.org"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-MX"
      className={`${sourceSerif.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-text antialiased">
        {children}
      </body>
    </html>
  );
}
