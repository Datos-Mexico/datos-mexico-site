import { Check } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Body } from "@/components/typography";

const compromisos = [
  "Independencia editorial frente a partidos, gobiernos y empresas",
  "Código fuente abierto en repositorio público",
  "Metodología documentada en cada publicación",
  "Validación reproducible contra fuentes oficiales (INEGI, CONSAR, Banxico)",
  "Transparencia sobre fuentes de financiamiento (cuando existan)",
  "Rectificación pública de errores cuando se detecten",
];

export function Gobernanza() {
  return (
    <section id="gobernanza" className="border-b border-border py-20 md:py-24">
      <Container>
        <SectionHeader
          eyebrow="Gobernanza"
          title="Cómo nos hacemos responsables."
        />

        <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <Body className="max-w-xl text-[17px] leading-[1.7]">
              Datos México es un proyecto académico independiente. No recibimos
              financiamiento de partidos políticos ni de gobiernos. Nuestro código
              y nuestra metodología son públicos. Estos son los compromisos
              operativos que adoptamos para que cualquiera pueda auditarnos.
            </Body>
          </div>

          <ul className="space-y-4">
            {compromisos.map((c) => (
              <li key={c} className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-3 w-3 text-primary" aria-hidden="true" />
                </span>
                <Body as="span" className="text-[16px] leading-[1.6]">
                  {c}
                </Body>
              </li>
            ))}
          </ul>
        </div>

        <aside
          aria-label="Estado actual del proyecto"
          className="mt-14 rounded-lg bg-muted px-6 py-8 md:px-10 md:py-10"
        >
          <p className="font-sans text-[14px] leading-[1.65] text-text md:text-[15px]">
            <strong className="font-semibold text-foreground">
              Estado actual del proyecto.
            </strong>{" "}
            Datos México opera de manera informal mientras evaluamos su
            constitución como Asociación Civil.{" "}
            <span className="text-text-subtle">
              [PENDIENTE: actualizar cuando haya figura legal definida]
            </span>
            . No hemos recibido financiamiento externo a la fecha. Los costos de
            infraestructura los cubre el equipo fundador.
          </p>
        </aside>
      </Container>
    </section>
  );
}
