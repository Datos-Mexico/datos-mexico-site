import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Mono } from "@/components/typography";
import { sar29Entregas, sar29Dataset } from "@/lib/pensiones/sar29";

export const metadata: Metadata = {
  title: "El SAR en 29 años",
  description:
    "Serie editorial de 29 entregas anuales sobre el Sistema de Ahorro para el Retiro (1997–2025), con cifras verificadas contra fuentes oficiales y panel de datos abierto.",
  alternates: { canonical: "/pensiones/sar-29" },
  openGraph: {
    title: "El SAR en 29 años — Datos México",
    description:
      "Serie editorial de 29 entregas anuales sobre el Sistema de Ahorro para el Retiro (1997–2025), con cifras verificadas contra fuentes oficiales y panel de datos abierto.",
    url: "/pensiones/sar-29",
    type: "website",
  },
};

export default function Sar29Page() {
  return (
    <section className="border-b border-border py-20 md:py-24">
      <Container>
        <SectionHeader
          eyebrow="Pensiones"
          title="El SAR en 29 años."
          lead="Una entrega por cada año del Sistema de Ahorro para el Retiro, de 1997 a 2025. Cada entrega es un documento autocontenido con cifras verificadas contra fuentes oficiales (CONSAR, INEGI, Banxico), fuentes citadas y limitaciones declaradas. La serie es descriptiva-retrospectiva: no realiza proyecciones propias."
        />

        {/* Slot Fase 2: componente visual SAR-29 (línea de tiempo animada).
            Recibe las entregas de lib/pensiones/sar29.ts extendidas con mmdp. */}

        <div className="mt-14 grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
          {sar29Entregas.map((e) => (
            <a
              key={e.year}
              href={e.href}
              className="inline-flex items-center justify-center rounded-md border border-border px-3 py-3 font-mono text-[14px] text-text-subtle transition-colors hover:border-foreground hover:text-foreground"
            >
              {e.year}
            </a>
          ))}
        </div>

        <div className="mt-14 max-w-2xl rounded-lg border border-border bg-muted/40 p-8">
          <Mono className="block text-[12px]">{sar29Dataset.id}</Mono>
          <p className="mt-3 font-sans text-[16px] leading-[1.6] text-text-subtle">
            Panel mensual del SAR por AFORE, 1997–2025. La base de datos que
            alimenta la serie, con diccionario de variables y apéndice
            metodológico.
          </p>
          <div className="mt-5 flex flex-wrap gap-4">
            <a
              href={sar29Dataset.csv}
              className="font-mono text-[13px] text-primary underline-offset-4 hover:underline"
            >
              Descargar CSV
            </a>
            <a
              href={sar29Dataset.diccionario}
              className="font-mono text-[13px] text-primary underline-offset-4 hover:underline"
            >
              Diccionario de variables
            </a>
            <a
              href={sar29Dataset.apendice}
              className="font-mono text-[13px] text-primary underline-offset-4 hover:underline"
            >
              Apéndice metodológico
            </a>
          </div>
        </div>

        <Mono className="mt-10 block text-[12px]">
          29 entregas · 1997–2025 · serie descriptiva-retrospectiva
        </Mono>
      </Container>
    </section>
  );
}
