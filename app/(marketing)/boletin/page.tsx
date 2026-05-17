import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { BoletinHero } from "@/components/boletin/Hero";
import { Formatos } from "@/components/boletin/Formatos";
import { Compromisos } from "@/components/boletin/Compromisos";
import { Archivo } from "@/components/boletin/Archivo";
import { Preguntas } from "@/components/boletin/Preguntas";
import { CtaFinal } from "@/components/boletin/CtaFinal";

export const metadata: Metadata = {
  title: "Boletín",
  description:
    "Suscríbete al boletín del observatorio. Análisis profundos, notas breves y comentarios de coyuntura económica de México, con la misma metodología verificable que aplicamos a todo nuestro trabajo.",
  alternates: { canonical: "/boletin" },
  openGraph: {
    title: "Boletín — Datos México",
    description:
      "Análisis, notas breves y comentarios de coyuntura económica de México. Sin spam, sin paywalls, sin venta de datos.",
    url: "/boletin",
    type: "website",
    images: [
      {
        url: "/og/og-boletin.png",
        width: 1200,
        height: 630,
        alt: "Boletín — Datos México",
      },
    ],
  },
  twitter: {
    title: "Boletín — Datos México",
    description:
      "El boletín del observatorio: análisis, notas breves y comentarios de coyuntura.",
    images: ["/og/og-boletin.png"],
  },
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Boletín — Datos México",
  description:
    "Página de suscripción al boletín del observatorio Datos México.",
  inLanguage: "es-MX",
  url: "https://datosmexico.org/boletin",
  mainEntity: {
    "@type": "Organization",
    name: "Datos México",
    url: "https://datosmexico.org",
  },
};

/*
  PENDIENTES de esta página:

  Form — handler real:
    - Reemplazar `defaultSimulatedSubmit` en `lib/newsletter.ts` por llamada
      al proveedor cuando esté elegido (Mailchimp, Buttondown, ConvertKit,
      Substack u otro). La firma del handler debe permanecer igual; el
      componente <NewsletterForm> no requiere cambios.

  Sección "Qué vas a recibir" (Formatos.tsx):
    - Confirmar opción de "resumen semanal" cuando elijamos proveedor.

  Archivo:
    - Sustituir bloque vacío por <BoletinArchive items={...}> cuando existan
      boletines enviados.
*/

export default function BoletinPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <Container>
        <BoletinHero />
        <Formatos />
        <Compromisos />
        <Archivo />
        <Preguntas />
      </Container>
      <CtaFinal />
    </>
  );
}
