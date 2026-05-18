import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { H2 } from "@/components/typography";
import { PublicationHeader } from "@/components/publicaciones/PublicationHeader";
import { PublicationMeta } from "@/components/publicaciones/PublicationMeta";
import { PublicationFooter } from "@/components/publicaciones/PublicationFooter";
import { PublicationCard } from "@/components/publicaciones/PublicationCard";
import {
  getAllSlugs,
  getPublicationBySlug,
  getRelatedPublications,
} from "@/lib/publicaciones/loader";
import { getCategoryBySlug } from "@/lib/publicaciones/categories";
import { formatHighwireDate } from "@/lib/publicaciones/format";

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pub = await getPublicationBySlug(slug);
  if (!pub) return {};
  const category = getCategoryBySlug(pub.category);
  const pubUrl = `https://datosmexico.org/publicaciones/${pub.slug}`;
  const keywordsValue =
    pub.keywords?.join("; ") ?? category?.label ?? "";
  return {
    title: pub.title,
    description: pub.excerpt,
    alternates: { canonical: `/publicaciones/${pub.slug}` },
    openGraph: {
      title: pub.title,
      description: pub.excerpt,
      type: "article",
      publishedTime: pub.publishedAt,
      modifiedTime: pub.updatedAt ?? pub.publishedAt,
      authors: ["Equipo de Datos México"],
      url: `/publicaciones/${pub.slug}`,
      images: [
        {
          url: "/og/og-default.png",
          width: 1200,
          height: 630,
          alt: `${pub.title} — Datos México`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pub.title,
      description: pub.excerpt,
      images: ["/og/og-default.png"],
    },
    other: {
      citation_title: pub.title,
      citation_author: "Equipo de Datos México",
      citation_publication_date: formatHighwireDate(pub.publishedAt),
      citation_journal_title: "Datos México",
      citation_abstract_html_url: pubUrl,
      citation_fulltext_html_url: pubUrl,
      citation_abstract: pub.abstract ?? pub.excerpt,
      citation_keywords: keywordsValue,
      citation_language: "es",
    },
  };
}

export default async function PublicationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pub = await getPublicationBySlug(slug);
  if (!pub) notFound();

  const related = await getRelatedPublications(pub.slug, 3);
  const category = getCategoryBySlug(pub.category);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: pub.title,
    description: pub.excerpt,
    abstract: pub.abstract ?? pub.excerpt,
    image: ["https://datosmexico.org/og/og-default.png"],
    datePublished: pub.publishedAt,
    dateModified: pub.updatedAt ?? pub.publishedAt,
    author: {
      "@type": "Organization",
      name: "Datos México",
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
      "@type": "Periodical",
      name: "Datos México",
      url: "https://datosmexico.org",
    },
    articleSection: category?.label,
    keywords: pub.keywords?.join(", ") ?? category?.label,
    inLanguage: "es-MX",
    url: `https://datosmexico.org/publicaciones/${pub.slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://datosmexico.org/publicaciones/${pub.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <article className="border-b border-border py-20 md:py-24">
        <Container>
          <PublicationHeader publication={pub} />

          <div className="mt-12 max-w-3xl">
            <pub.Component />
          </div>

          <PublicationMeta publication={pub} />
          <PublicationFooter publication={pub} />
        </Container>
      </article>

      {related.length > 0 && (
        <section className="border-b border-border py-20 md:py-24">
          <Container>
            <H2>Publicaciones relacionadas</H2>
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
              {related.map((p) => (
                <PublicationCard key={p.slug} publication={p} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
