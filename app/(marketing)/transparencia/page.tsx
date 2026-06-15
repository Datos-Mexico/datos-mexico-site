import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Body, Mono } from "@/components/typography";
import { TransparenciaCard } from "@/components/transparencia/TransparenciaCard";
import { getAllPiezas } from "@/lib/transparencia/loader";

export const metadata: Metadata = {
  title: "Transparencia",
  description:
    "Encargos de prensa atendidos por el observatorio: piezas públicas sobre transparencia y rendición de cuentas, con sus fuentes verificadas y la frontera explícita de lo desconocido.",
  alternates: { canonical: "/transparencia" },
  openGraph: {
    title: "Transparencia — Datos México",
    description:
      "Encargos de prensa atendidos por el observatorio: piezas públicas sobre transparencia y rendición de cuentas, con sus fuentes verificadas y la frontera explícita de lo desconocido.",
    url: "/transparencia",
    type: "website",
  },
};

export default async function TransparenciaPage() {
  const piezas = await getAllPiezas();

  return (
    <section className="border-b border-border py-20 md:py-24">
      <Container>
        <SectionHeader
          eyebrow="Transparencia"
          title="Encargos de prensa del observatorio."
          lead="Piezas públicas sobre transparencia y rendición de cuentas atendidas como encargo de prensa. Cada pieza documenta la pregunta del encargo, los hechos verificados, el marco aplicable y la frontera explícita de lo desconocido."
        />

        <div className="mt-10 max-w-3xl space-y-4">
          <Body className="font-sans text-[15px] leading-[1.7] text-text-subtle md:text-[17px] md:leading-[1.7]">
            Un encargo de prensa es una pregunta acotada y de interés
            público que un medio o periodista dirige al observatorio.
            El observatorio no produce la nota ni la interpreta:
            entrega datos verificados y trazables para que quien
            pregunta construya su trabajo sobre terreno firme. La
            interpretación es competencia de quien la recibe.
          </Body>
          <Body className="font-sans text-[15px] leading-[1.7] text-text-subtle md:text-[17px] md:leading-[1.7]">
            Cada caso publicado reúne la pregunta del encargo, el
            dossier de hechos verificados con sus fuentes primarias,
            el sustento normativo aplicable, el análisis del marco
            frente a los hechos, y la pieza pública firmada. El rastro
            académico completo de cada indagación es público y
            auditable en el repositorio del observatorio.
          </Body>
          <Body className="font-sans text-[15px] leading-[1.7] text-text-subtle md:text-[17px] md:leading-[1.7]">
            Los casos se publican cuando se cierran, no en calendario.
          </Body>
        </div>

        {piezas.length === 0 ? (
          <div className="mt-14 max-w-2xl rounded-lg border-2 border-dashed border-border bg-muted/40 p-10 text-center">
            <Body className="text-[16px] leading-[1.6] text-text-subtle">
              Esta sección está en construcción. Las primeras piezas
              estarán disponibles próximamente.
            </Body>
          </div>
        ) : (
          <>
            <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
              {piezas.map((p) => (
                <TransparenciaCard key={p.slug} pieza={p} />
              ))}
            </div>
            <Mono className="mt-10 block text-center text-[12px]">
              {piezas.length} {piezas.length === 1 ? "pieza" : "piezas"}
            </Mono>
          </>
        )}
      </Container>
    </section>
  );
}
