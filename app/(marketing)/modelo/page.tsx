import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ModeloHero } from "@/components/modelo/Hero";
import { PorQueExiste } from "@/components/modelo/PorQueExiste";
import { Problema } from "@/components/modelo/Problema";
import { TresCapas } from "@/components/modelo/TresCapas";
import { ReglaIndependencia } from "@/components/modelo/ReglaIndependencia";
import { Sostenibilidad } from "@/components/modelo/Sostenibilidad";
import { ModeloGobernanza } from "@/components/modelo/Gobernanza";
import { Compromisos } from "@/components/modelo/Compromisos";
import { SigueObservatorio } from "@/components/modelo/SigueObservatorio";
import { Cierre } from "@/components/modelo/Cierre";
import { ModeloTOC } from "@/components/modelo/ModeloTOC";

export const metadata: Metadata = {
  title: "Modelo institucional",
  description:
    "Cómo opera el observatorio frente a quien lo financia o le encarga trabajo. Tres capas de trabajo, una regla de independencia y transparencia financiera completa.",
  alternates: { canonical: "/modelo" },
  openGraph: {
    title: "Modelo institucional — Datos México",
    description:
      "Tres capas de trabajo, una regla de independencia, y transparencia sobre cómo se sostiene el observatorio.",
    url: "/modelo",
    type: "article",
    images: [
      {
        url: "/og/og-modelo.png",
        width: 1200,
        height: 630,
        alt: "Modelo institucional — Datos México",
      },
    ],
  },
  twitter: {
    title: "Modelo institucional — Datos México",
    description:
      "Cómo opera el observatorio frente a quien lo financia o le encarga trabajo.",
    images: ["/og/og-modelo.png"],
  },
};

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "Modelo institucional — Datos México",
  description:
    "Documento institucional que articula públicamente cómo opera el observatorio, cómo se sostiene y bajo qué reglas opera frente a quien lo financia o le encarga trabajo.",
  inLanguage: "es-MX",
  url: "https://datosmexico.org/modelo",
  about: {
    "@type": "Organization",
    "@id": "https://datosmexico.org/#organization",
    name: "Datos México",
  },
  publisher: {
    "@type": "Organization",
    name: "Datos México",
    url: "https://datosmexico.org",
  },
};

export default function ModeloPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <Container>
        <div className="lg:grid lg:grid-cols-[1fr_14rem] lg:gap-x-16 xl:gap-x-20">
          <article className="min-w-0 max-w-3xl">
            <ModeloHero />
            <PorQueExiste />
            <Problema />
            <TresCapas />
          </article>
          <ModeloTOC />
        </div>
      </Container>

      {/* La regla de independencia se sale del contenedor por intención de diseño:
          es el corazón del documento y queda visualmente destacada. */}
      <ReglaIndependencia />

      <Container>
        <div className="lg:grid lg:grid-cols-[1fr_14rem] lg:gap-x-16 xl:gap-x-20">
          <article className="min-w-0 max-w-3xl">
            <Sostenibilidad />
            <ModeloGobernanza />
            <Compromisos />
            <SigueObservatorio />
            <Cierre />
          </article>
          <div className="hidden lg:block" />
        </div>
      </Container>
    </>
  );
}
