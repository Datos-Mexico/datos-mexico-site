import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Eyebrow, H2, Lead, Body } from "@/components/typography";

const respaldos = [
  "Datos validados contra publicaciones oficiales (INEGI, CONSAR, Banxico)",
  "Metodología pública y código abierto",
  "Independencia editorial",
  // [PENDIENTE: aliados/respaldos institucionales]
  "Colaboraciones académicas con el ITAM",
];

export function QuienesSomosPreview() {
  return (
    <section className="border-b border-border py-20 md:py-28">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Eyebrow className="mb-5">Quiénes somos</Eyebrow>
            <H2>Un observatorio académico, transparente y reproducible.</H2>
            <Lead className="mt-6 max-w-2xl">
              Datos México es un observatorio independiente formado por estudiantes
              y egresados del ITAM. Trabajamos con microdatos oficiales y publicamos
              análisis verificables, con metodología abierta y sin agenda partidista.
            </Lead>
            <Link
              href="/quienes-somos"
              className="mt-8 inline-flex items-center gap-1.5 font-sans text-[15px] font-medium text-primary hover:gap-2.5 transition-[gap]"
            >
              Conoce al equipo
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <aside className="lg:col-span-2">
            <div className="rounded-lg border border-border bg-muted/40 p-6 md:p-8">
              <h3 className="font-serif text-[20px] font-semibold text-foreground">
                Respaldo institucional
              </h3>
              <ul className="mt-5 space-y-3">
                {respaldos.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check
                      className="mt-1 h-4 w-4 flex-shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <Body as="span" className="text-[15px] leading-[1.55]">
                      {item}
                    </Body>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
