import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PrensaHero } from "@/components/prensa/Hero";
import { Voceros } from "@/components/prensa/Voceros";
import { Citarnos } from "@/components/prensa/Citarnos";
import { Recursos } from "@/components/prensa/Recursos";
import { Preguntas } from "@/components/prensa/Preguntas";
import { PrensaCtaFinal } from "@/components/prensa/CtaFinal";

export const metadata: Metadata = {
  title: "Prensa",
  description:
    "Recursos para periodistas y medios. Canal único de contacto con el observatorio, cómo citarnos correctamente y materiales descargables.",
  alternates: { canonical: "/prensa" },
  openGraph: {
    title: "Prensa — Datos México",
    description:
      "Recursos para periodistas y medios. Canal único de contacto con el observatorio, cómo citarnos correctamente y materiales descargables.",
    url: "/prensa",
    type: "website",
    images: [
      {
        url: "/og/og-prensa.png",
        width: 1200,
        height: 630,
        alt: "Prensa — Datos México",
      },
    ],
  },
  twitter: {
    title: "Prensa — Datos México",
    description:
      "Recursos para periodistas y medios. Canal único de contacto con el observatorio, cómo citarnos correctamente y materiales descargables.",
    images: ["/og/og-prensa.png"],
  },
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Prensa — Datos México",
  description:
    "Página de recursos para periodistas y medios del observatorio Datos México.",
  inLanguage: "es-MX",
  url: "https://datosmexico.org/prensa",
  mainEntity: {
    "@type": "Organization",
    name: "Datos México",
    url: "https://datosmexico.org",
    email: "prensa@datosmexico.org",
  },
  potentialAction: {
    "@type": "CommunicateAction",
    name: "Contactar al equipo de prensa de Datos México",
    target: "mailto:prensa@datosmexico.org",
    recipient: {
      "@type": "Organization",
      name: "Datos México",
    },
  },
};

/*
  PENDIENTES de esta página:

  Recursos descargables (Recursos.tsx) — hoy disabled con badge "Próximamente":
    - .zip de logos
    - PDF del kit de prensa
*/

export default function PrensaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <Container>
        <PrensaHero />
        <Voceros />
        <Citarnos />
        <Recursos />
        <Preguntas />
      </Container>
      <PrensaCtaFinal />
    </>
  );
}
