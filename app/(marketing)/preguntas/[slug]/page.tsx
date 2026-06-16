import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { ArticuloHeader } from "@/components/preguntas/ArticuloHeader";
import { ArticuloBanner } from "@/components/preguntas/ArticuloBanner";
import { MarcasTemporales } from "@/components/preguntas/MarcasTemporales";
import { ArticuloBody } from "@/components/preguntas/ArticuloBody";
import { ArticuloMeta } from "@/components/preguntas/ArticuloMeta";
import {
  getAllSlugs,
  getArticuloPorSlug,
} from "@/lib/preguntas/loader";
import { formatHighwireDate } from "@/lib/publicaciones/format";

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

function buildDescription(caveats: string[], metodo: string): string {
  const base = caveats[0] ?? metodo;
  if (base.length <= 160) return base;
  return `${base.slice(0, 157).trim()}…`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const articulo = await getArticuloPorSlug(slug);
  if (!articulo) return {};

  const description = buildDescription(articulo.caveats, articulo.metodo);
  const url = `https://datosmexico.org/preguntas/${articulo.slug}`;
  const autor =
    articulo.estado === "pre-firma"
      ? "Equipo de Datos México"
      : (articulo.revisor ?? "Equipo de Datos México");

  const keywordsList = [
    articulo.tags_tema_principal,
    ...articulo.tags_tema_secundario,
  ];

  return {
    title: articulo.pregunta,
    description,
    alternates: { canonical: `/preguntas/${articulo.slug}` },
    openGraph: {
      title: articulo.pregunta,
      description,
      type: "article",
      publishedTime: articulo.fecha_creacion,
      modifiedTime: articulo.fecha_ultima_actualizacion,
      authors: [autor],
      url: `/preguntas/${articulo.slug}`,
      images: [
        {
          url: "/og/og-default.png",
          width: 1200,
          height: 630,
          alt: `${articulo.pregunta} — Datos México`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: articulo.pregunta,
      description,
      images: ["/og/og-default.png"],
    },
    other: {
      citation_title: articulo.pregunta,
      citation_author: autor,
      citation_publication_date: formatHighwireDate(articulo.fecha_creacion),
      citation_journal_title: "Observatorio Datos México",
      citation_abstract_html_url: url,
      citation_fulltext_html_url: url,
      citation_abstract: description,
      citation_keywords: keywordsList.join("; "),
      citation_language: "es",
      citation_id: articulo.id_canonico,
    },
  };
}

export default async function ArticuloPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const articulo = await getArticuloPorSlug(slug);
  if (!articulo) notFound();

  const url = `https://datosmexico.org/preguntas/${articulo.slug}`;
  const description = buildDescription(articulo.caveats, articulo.metodo);
  const autor =
    articulo.estado === "pre-firma"
      ? "Equipo de Datos México"
      : (articulo.revisor ?? "Equipo de Datos México");

  const respuestaInicio = articulo.content
    .split("## Respuesta")[1]
    ?.split("##")[0]
    ?.replace(/^\n+/, "")
    .split("\n\n")[0]
    ?.trim();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: articulo.pregunta,
      text: articulo.pregunta,
      answerCount: 1,
      acceptedAnswer: {
        "@type": "Answer",
        text: respuestaInicio ?? description,
        dateCreated: articulo.fecha_creacion,
        author: {
          "@type": "Organization",
          name: "Observatorio Datos México",
          url: "https://datosmexico.org",
        },
      },
      dateCreated: articulo.fecha_creacion,
      dateModified: articulo.fecha_ultima_actualizacion,
      author: {
        "@type": "Organization",
        name: "Observatorio Datos México",
      },
    },
    inLanguage: "es-MX",
    url,
    isPartOf: {
      "@type": "WebSite",
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
    about: {
      "@type": "Thing",
      name: articulo.tags_tema_principal,
    },
    keywords: [
      articulo.tags_tema_principal,
      ...articulo.tags_tema_secundario,
    ].join(", "),
    creator: {
      "@type": "Organization",
      name: autor,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="border-b border-border py-20 md:py-24">
        <Container>
          <ArticuloHeader articulo={articulo} />
          <ArticuloBanner articulo={articulo} />
          <MarcasTemporales articulo={articulo} />
          <ArticuloBody body_html={articulo.body_html} />
          <ArticuloMeta articulo={articulo} />
        </Container>
      </article>
    </>
  );
}
