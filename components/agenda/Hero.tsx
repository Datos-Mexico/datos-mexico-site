import { Container } from "@/components/layout/Container";
import { H1, Lead, Eyebrow } from "@/components/typography";

export function AgendaHero() {
  return (
    <section className="border-b border-border pt-24 pb-16 md:pt-32 md:pb-20">
      <Container>
        <div className="max-w-3xl">
          <Eyebrow className="mb-5 text-accent">Operación del observatorio</Eyebrow>
          <H1>Agenda</H1>
          <Lead className="mt-7">
            Cadencia de trabajo y producción del Observatorio Datos México:
            publicaciones planificadas, sesiones de trabajo y los hitos
            institucionales del semestre en curso.
          </Lead>
        </div>
      </Container>
    </section>
  );
}
