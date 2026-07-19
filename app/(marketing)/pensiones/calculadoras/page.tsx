import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Body, Mono } from "@/components/typography";

export const metadata: Metadata = {
  title: "Calculadoras de pensiones",
  description:
    "Herramientas educativas de proyección de pensión IMSS (Ley 73, Ley 97 y transición) del observatorio Datos México: escenarios en pesos de hoy, supuestos públicos y metodología validada actuarialmente. No es asesoría financiera.",
  alternates: { canonical: "/pensiones/calculadoras" },
  openGraph: {
    title: "Calculadoras de pensiones — Datos México",
    description:
      "Herramientas educativas de proyección de pensión IMSS con supuestos públicos y metodología validada actuarialmente.",
    url: "/pensiones/calculadoras",
    type: "website",
  },
};

export default function CalculadorasPage() {
  return (
    <section className="border-b border-border py-20 md:py-24">
      <Container>
        <SectionHeader
          eyebrow="Pensiones · Herramientas"
          title="Calculadoras de pensiones."
          lead="Un conjunto de herramientas educativas para proyectar tu pensión IMSS bajo la Ley 73, la Ley 97 y la transición entre ambas: escenarios en pesos de hoy, con supuestos públicos y metodología validada actuarialmente. Informan; las decisiones son tuyas."
        />

        <div className="mt-14 max-w-2xl rounded-lg border-2 border-dashed border-border bg-muted/40 p-10">
          <Mono className="block text-[12px]">Publicación por etapas</Mono>
          <Body className="mt-4 text-[16px] leading-[1.65] text-text-subtle">
            El observatorio está incorporando estas herramientas por etapas.
            Cada calculadora se publica con su metodología, sus fuentes
            oficiales versionadas y la distinción explícita entre parámetros de
            ley, datos verificados y supuestos de escenario. Vuelve pronto.
          </Body>
        </div>

        <Mono className="mt-10 block text-[12px]">
          Proyecciones educativas · no constituyen asesoría financiera
        </Mono>
      </Container>
    </section>
  );
}
