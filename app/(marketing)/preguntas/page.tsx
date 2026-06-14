import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Body, Mono } from "@/components/typography";
import { ArticuloCard } from "@/components/preguntas/ArticuloCard";
import { getAllArticulos } from "@/lib/preguntas/loader";

export const metadata: Metadata = {
  title: "Preguntas y respuestas del observatorio",
  description:
    "Corpus pregunta-respuesta del Observatorio Datos México: preguntas concretas sobre el aparato público y las realidades cuantificables de México, respondidas con datos oficiales y metodología transparente.",
  alternates: { canonical: "/preguntas" },
  openGraph: {
    title: "Preguntas y respuestas — Observatorio Datos México",
    description:
      "Corpus pregunta-respuesta del observatorio: respuestas empíricas a preguntas concretas sobre México, con datos oficiales y metodología explícita.",
    url: "/preguntas",
    type: "website",
  },
};

export default async function PreguntasPage() {
  const articulos = await getAllArticulos();

  return (
    <section className="border-b border-border py-20 md:py-24">
      <Container>
        <SectionHeader
          eyebrow="Preguntas"
          title="Corpus pregunta-respuesta del observatorio."
          lead="Preguntas concretas sobre México respondidas con datos oficiales, metodología reproducible y caveats explícitos. Cada artículo declara su estado, su fuente y su versión."
        />

        {articulos.length === 0 ? (
          <div className="mt-14 max-w-2xl rounded-lg border-2 border-dashed border-border bg-muted/40 p-10 text-center">
            <Body className="text-[16px] leading-[1.6] text-text-subtle">
              El corpus está en construcción. Los primeros artículos llegarán pronto.
            </Body>
          </div>
        ) : (
          <>
            <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
              {articulos.map((a) => (
                <ArticuloCard key={a.slug} articulo={a} />
              ))}
            </div>
            <Mono className="mt-10 block text-center text-[12px]">
              {articulos.length}{" "}
              {articulos.length === 1 ? "artículo" : "artículos"} en el corpus
            </Mono>
          </>
        )}
      </Container>
    </section>
  );
}
