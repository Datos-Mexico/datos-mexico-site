import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { TransparenciaHeader } from "@/components/transparencia/TransparenciaHeader";
import { TransparenciaBody } from "@/components/transparencia/TransparenciaBody";
import { TransparenciaMeta } from "@/components/transparencia/TransparenciaMeta";
import { TransparenciaFooter } from "@/components/transparencia/TransparenciaFooter";
import { BannerBorrador } from "@/components/transparencia/BannerBorrador";
import {
  getAllPublishedSlugs,
  getPiezaPorSlug,
} from "@/lib/transparencia/loader";
import { formatHighwireDate } from "@/lib/publicaciones/format";

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pieza = await getPiezaPorSlug(slug);
  if (!pieza) return {};

  const url = `https://datosmexico.org/transparencia/${pieza.slug}`;
  const keywordsValue = pieza.keywords?.join("; ") ?? "transparencia";

  const meta: Metadata = {
    title: pieza.title,
    description: pieza.excerpt,
    alternates: { canonical: `/transparencia/${pieza.slug}` },
    openGraph: {
      title: pieza.title,
      description: pieza.excerpt,
      type: "article",
      publishedTime: pieza.publishedAt,
      modifiedTime: pieza.updatedAt ?? pieza.publishedAt,
      authors: ["Observatorio Datos México"],
      url: `/transparencia/${pieza.slug}`,
      images: [
        {
          url: "/og/og-default.png",
          width: 1200,
          height: 630,
          alt: `${pieza.title} — Datos México`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pieza.title,
      description: pieza.excerpt,
      images: ["/og/og-default.png"],
    },
    other: {
      citation_title: pieza.title,
      citation_author: "Observatorio Datos México",
      citation_publication_date: formatHighwireDate(pieza.publishedAt),
      citation_journal_title: "Observatorio Datos México",
      citation_abstract_html_url: url,
      citation_fulltext_html_url: url,
      citation_abstract: pieza.excerpt,
      citation_keywords: keywordsValue,
      citation_language: "es",
    },
  };

  if (pieza.status === "draft") {
    meta.robots = { index: false, follow: false };
  }

  return meta;
}

export default async function PiezaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pieza = await getPiezaPorSlug(slug);
  if (!pieza) notFound();
  if (
    pieza.status !== "published" &&
    process.env.NODE_ENV !== "development"
  ) {
    notFound();
  }

  const url = `https://datosmexico.org/transparencia/${pieza.slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: pieza.title,
    description: pieza.excerpt,
    image: ["https://datosmexico.org/og/og-default.png"],
    datePublished: pieza.publishedAt,
    dateModified: pieza.updatedAt ?? pieza.publishedAt,
    author: {
      "@type": "Organization",
      name: "Observatorio Datos México",
      url: "https://datosmexico.org",
    },
    publisher: {
      "@type": "Organization",
      "@id": "https://datosmexico.org/#organization",
      name: "Datos México",
      url: "https://datosmexico.org",
      logo: {
        "@type": "ImageObject",
        url: "https://datosmexico.org/android-chrome-512x512-v2.png",
      },
    },
    isPartOf: {
      "@type": "WebSite",
      name: "Datos México",
      url: "https://datosmexico.org",
    },
    keywords: pieza.keywords?.join(", "),
    inLanguage: "es-MX",
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return (
    <>
      {pieza.status === "published" && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
      )}
      <article className="border-b border-border py-20 md:py-24">
        <Container>
          {pieza.status === "draft" && <BannerBorrador />}
          <TransparenciaHeader pieza={pieza} />
          <TransparenciaBody html={pieza.html} />
          <TransparenciaMeta caso={pieza.caso} repoPath={pieza.repoPath} />
          <TransparenciaFooter pieza={pieza} />
        </Container>
      </article>
    </>
  );
}
