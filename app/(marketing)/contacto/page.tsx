import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ContactoHero } from "@/components/contacto/Hero";
import { Canales } from "@/components/contacto/Canales";
import { Preguntas } from "@/components/contacto/Preguntas";
import { Redes } from "@/components/contacto/Redes";
import { ContactoCierre } from "@/components/contacto/Cierre";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Canales de contacto del observatorio: prensa, investigación, errores en datos, sumarse al equipo, consultas generales. Elige el canal correcto para que llegues a la persona indicada.",
  alternates: { canonical: "/contacto" },
  openGraph: {
    title: "Contacto — Datos México",
    description:
      "Canales de contacto del observatorio organizados por intención: prensa, investigación, errores, equipo, consultas generales.",
    url: "/contacto",
    type: "website",
    images: [
      {
        url: "/og/og-contacto.png",
        width: 1200,
        height: 630,
        alt: "Contacto — Datos México",
      },
    ],
  },
  twitter: {
    title: "Contacto — Datos México",
    description:
      "Canales de contacto del observatorio. Elige el canal correcto para que llegues a la persona indicada.",
    images: ["/og/og-contacto.png"],
  },
};

const contactPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contacto — Datos México",
  description:
    "Página de contacto del observatorio Datos México con canales especializados por intención.",
  inLanguage: "es-MX",
  url: "https://datosmexico.org/contacto",
  mainEntity: {
    "@type": "Organization",
    name: "Datos México",
    url: "https://datosmexico.org",
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: "contacto@datosmexico.org",
        availableLanguage: ["es-MX"],
        description: "Consultas generales del observatorio",
      },
      {
        "@type": "ContactPoint",
        contactType: "press",
        email: "prensa@datosmexico.org",
        availableLanguage: ["es-MX"],
        description: "Prensa, entrevistas y atribución de cifras",
      },
      {
        "@type": "ContactPoint",
        contactType: "academic",
        email: "academia@datosmexico.org",
        availableLanguage: ["es-MX"],
        description:
          "Investigación, replicación de análisis y colaboraciones académicas",
      },
      {
        "@type": "ContactPoint",
        contactType: "technical support",
        email: "errores@datosmexico.org",
        availableLanguage: ["es-MX"],
        description: "Reporte de errores e inconsistencias en publicaciones",
      },
      {
        "@type": "ContactPoint",
        contactType: "recruitment",
        email: "equipo@datosmexico.org",
        availableLanguage: ["es-MX"],
        description: "Sumarse al equipo del observatorio",
      },
    ],
  },
};

/*
  PENDIENTES de esta página:

  Redes sociales (4 plataformas) — handles y URLs reales:
    - Twitter / X (@datosmexico)
    - LinkedIn (Datos México)
    - GitHub (datos-mexico) — también referenciado en /metodologia FAQ
    - YouTube (Datos México) — hoy disabled con badge "Próximamente"

  Repositorio público:
    - URL real (en FAQ #5 de esta página y en /metodologia#auditoria)
*/

export default function ContactoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd) }}
      />
      <Container>
        <ContactoHero />
        <Canales />
        <Preguntas />
        <Redes />
        <ContactoCierre />
      </Container>
    </>
  );
}
