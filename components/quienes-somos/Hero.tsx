import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { H1, Lead, Eyebrow } from "@/components/typography";

export function QuienesSomosHero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-border bg-zinc-950">
      {/* Foto del auditorio como atmósfera del Hero. Va detrás del texto a
          ancho completo. Los rostros quedan secundarios porque viven detrás
          del scrim oscuro y de la prosa, no por recorte ni ocultamiento. */}
      <Image
        src="/quienes-somos/presentacion/auditorio.webp"
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"
      />

      <Container className="relative">
        <div className="max-w-3xl py-28 md:py-40">
          <Eyebrow className="mb-5 text-accent">Quiénes somos</Eyebrow>
          <H1 className="text-white">
            Un observatorio académico, transparente y en construcción.
          </H1>
          <Lead className="mt-7 text-zinc-200">
            Datos México es un observatorio independiente con respaldo
            institucional del ITAM, formado por estudiantes, egresados y
            colaboradores con experiencia en ciencia de datos, economía y otras
            disciplinas. Trabajamos con microdatos oficiales y publicamos
            análisis verificables, con metodología abierta y sin agenda partidista.
          </Lead>
        </div>
      </Container>
    </section>
  );
}
