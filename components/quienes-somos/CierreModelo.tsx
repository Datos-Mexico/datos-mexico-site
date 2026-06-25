import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";

// Cierre conceptual de /quienes-somos: culmina el recorrido de identidad
// (misión, principios, equipo, gobernanza) y enlaza a /modelo, donde se
// articula cómo se sostiene el observatorio sin comprometer la
// independencia que esta página acaba de describir. Visualmente: banda
// bg-muted full-bleed para distinguir el cierre del flujo regular de
// secciones, alineada con el resto vía Container interno.
export function CierreModelo() {
  return (
    <section
      id="cierre"
      aria-labelledby="cierre-titulo"
      className="border-y border-border bg-muted py-24 md:py-32"
    >
      <Container>
        <div className="mx-auto max-w-2xl">
          <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-text-subtle">
            El siguiente paso del recorrido
          </p>

          <h2
            id="cierre-titulo"
            className="mt-5 font-serif text-[30px] font-semibold leading-[1.15] tracking-tight text-foreground md:text-[44px] md:leading-[1.1]"
          >
            Y así nos sostenemos.
          </h2>

          <p className="mt-7 font-sans text-[17px] leading-[1.65] text-text md:text-[19px] md:leading-[1.6]">
            Llegaste hasta el final del recorrido por la identidad del
            observatorio. Lo que falta es la pieza que vuelve posible todo
            lo anterior: cómo nos sostenemos económicamente sin
            comprometer la independencia que acabamos de describir.
          </p>

          <p className="mt-5 font-sans text-[17px] leading-[1.65] text-text md:text-[19px] md:leading-[1.6]">
            Lo articulamos públicamente en nuestro modelo institucional —
            el complemento operativo del Manifesto. Tres capas de trabajo,
            una regla de independencia, transparencia financiera completa.
          </p>

          <div className="mt-10">
            <Link
              href="/modelo"
              prefetch={false}
              className="group inline-flex items-center gap-3 rounded-md bg-foreground px-7 py-4 font-sans text-[16px] font-medium text-text-inverse transition-colors hover:bg-text md:text-[17px]"
            >
              Lee el modelo institucional
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
