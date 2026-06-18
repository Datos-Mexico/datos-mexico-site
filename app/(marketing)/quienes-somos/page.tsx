import type { Metadata } from "next";
import { QuienesSomosHero } from "@/components/quienes-somos/Hero";
import { Principios } from "@/components/quienes-somos/Principios";
import { Historia } from "@/components/quienes-somos/Historia";
import { Equipo } from "@/components/quienes-somos/Equipo";
import { Asesoria } from "@/components/quienes-somos/Asesoria";
import { Acompanamiento } from "@/components/quienes-somos/Acompanamiento";
import { Areas } from "@/components/quienes-somos/Areas";
import { Gobernanza } from "@/components/quienes-somos/Gobernanza";
import { Contacto } from "@/components/quienes-somos/Contacto";
import { team } from "@/lib/team";

export const metadata: Metadata = {
  title: "Quiénes somos",
  description:
    "Datos México es un observatorio académico independiente con respaldo institucional del ITAM, formado por estudiantes, egresados y colaboradores. Conoce al equipo, nuestra misión y cómo nos organizamos.",
  alternates: { canonical: "/quienes-somos" },
  openGraph: {
    title: "Quiénes somos — Datos México",
    description:
      "Observatorio académico independiente con respaldo institucional del ITAM, formado por estudiantes, egresados y colaboradores. Equipo, misión, principios y gobernanza.",
    url: "/quienes-somos",
    type: "website",
    images: [
      {
        url: "/og/og-quienes-somos.png",
        width: 1200,
        height: 630,
        alt: "Quiénes somos — Datos México",
      },
    ],
  },
  twitter: {
    title: "Quiénes somos — Datos México",
    description:
      "Observatorio académico independiente con respaldo institucional del ITAM, formado por estudiantes, egresados y colaboradores.",
    images: ["/og/og-quienes-somos.png"],
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://datosmexico.org/#organization",
  name: "Datos México",
  url: "https://datosmexico.org",
  member: team.map((m) => ({
    "@type": "Person",
    name: m.name,
    // Solo incluimos description si hay bio real. No inventamos texto sobre
    // personas para llenar el schema.
    ...(m.bio !== "" && { description: m.bio }),
    ...(m.links.linkedin && { sameAs: [m.links.linkedin] }),
  })),
};

export default function QuienesSomosPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <QuienesSomosHero />
      <Principios />
      <Historia />
      <Equipo />
      <Asesoria />
      <Acompanamiento />
      <Areas />
      <Gobernanza />
      <Contacto />
    </>
  );
}
