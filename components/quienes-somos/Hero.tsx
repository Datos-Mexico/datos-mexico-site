import { Container } from "@/components/layout/Container";
import { H1, Lead, Eyebrow } from "@/components/typography";

export function QuienesSomosHero() {
  return (
    <section className="border-b border-border pt-24 pb-16 md:pt-32 md:pb-20">
      <Container>
        <div className="max-w-3xl">
          <Eyebrow className="mb-5 text-accent">Quiénes somos</Eyebrow>
          <H1>Un observatorio académico, transparente y en construcción.</H1>
          <Lead className="mt-7">
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
