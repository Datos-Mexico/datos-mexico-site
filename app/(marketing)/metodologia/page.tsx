import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { MetodologiaHero } from "@/components/metodologia/Hero";
import { Principios } from "@/components/metodologia/Principios";
import { Pipeline } from "@/components/metodologia/Pipeline";
import { Editorial } from "@/components/metodologia/Editorial";
import { Auditoria } from "@/components/metodologia/Auditoria";
import { AccesoProgramatico } from "@/components/metodologia/AccesoProgramatico";
import { Cambios } from "@/components/metodologia/Cambios";
import { Cierre } from "@/components/metodologia/Cierre";
import { MetodologiaTOC } from "@/components/metodologia/MetodologiaTOC";

export const metadata: Metadata = {
  title: "Metodología",
  description:
    "El método con el que procesamos, validamos y publicamos datos. Cinco principios, un pipeline técnico documentado, y los recursos que abrimos públicamente para que cualquiera nos audite.",
  alternates: { canonical: "/metodologia" },
  openGraph: {
    title: "Metodología — Datos México",
    description:
      "Cinco principios, un pipeline técnico documentado y los recursos que abrimos públicamente para que cualquiera audite nuestro trabajo.",
    url: "/metodologia",
    type: "article",
    images: [
      {
        url: "/og/og-metodologia.png",
        width: 1200,
        height: 630,
        alt: "Metodología — Datos México",
      },
    ],
  },
  twitter: {
    title: "Metodología — Datos México",
    description:
      "Cómo procesamos, validamos y publicamos datos. Reproducibilidad al peso desde el microdato.",
    images: ["/og/og-metodologia.png"],
  },
};

const techArticleJsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Metodología — Datos México",
  description:
    "Especificación operativa del método con el que el observatorio procesa, valida y publica datos.",
  inLanguage: "es-MX",
  proficiencyLevel: "Expert",
  url: "https://datosmexico.org/metodologia",
  author: {
    "@type": "Organization",
    name: "Datos México",
    url: "https://datosmexico.org",
  },
  publisher: {
    "@type": "Organization",
    name: "Datos México",
    url: "https://datosmexico.org",
  },
};

export default function MetodologiaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(techArticleJsonLd) }}
      />
      <Container>
        <div className="lg:grid lg:grid-cols-[1fr_14rem] lg:gap-x-16 xl:gap-x-20">
          <article className="min-w-0 max-w-3xl">
            <MetodologiaHero />
            <Principios />
            <Pipeline />
            <Editorial />
            <Auditoria />
            <AccesoProgramatico />
            <Cambios />
            <Cierre />
          </article>
          <MetodologiaTOC />
        </div>
      </Container>
    </>
  );
}
