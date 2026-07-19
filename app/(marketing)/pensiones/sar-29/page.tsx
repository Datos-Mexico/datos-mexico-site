import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Mono } from "@/components/typography";
import { Sar29Timeline } from "@/components/pensiones/Sar29Timeline";
import { sar29Dataset } from "@/lib/pensiones/sar29";

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
    <>
      <Sar29Timeline />

      <section
        id="serie-entregas"
        className="border-b border-t border-border py-20 md:py-24 scroll-mt-20"
      >
        <Container>
          <SectionHeader
            eyebrow="Pensiones"
            title="La serie, entrega por entrega."
            lead="Una entrega por cada año del Sistema de Ahorro para el Retiro, de 1997 a 2025. Cada entrega es un documento autocontenido con cifras verificadas contra fuentes oficiales (CONSAR, INEGI, Banxico), fuentes citadas y limitaciones declaradas. La serie es descriptiva-retrospectiva: no realiza proyecciones propias."
          />

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
    </>
  );
}
