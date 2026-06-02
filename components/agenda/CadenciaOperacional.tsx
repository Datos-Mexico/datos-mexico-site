import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Body, Mono } from "@/components/typography";
import type { CadenceItem } from "@/lib/agenda/types";

const CADENCE_LABEL: Record<CadenceItem["cadence"], string> = {
  daily: "Diaria",
  weekly: "Semanal",
  monthly: "Mensual",
};

export function CadenciaOperacional({
  items,
}: {
  items: readonly CadenceItem[];
}) {
  return (
    <section
      id="cadencia"
      aria-label="Cadencia operacional continua"
      className="border-b border-border py-20 md:py-24"
    >
      <Container>
        <SectionHeader
          eyebrow="Cadencia operacional"
          title="Los compromisos recurrentes del observatorio."
          lead="Patrones de trabajo que el observatorio sostiene de forma continua, independientemente de la semana ISO en curso."
        />

        <ul className="mt-14 divide-y divide-border border-t border-border">
          {items.map((item) => (
            <li key={item.id} className="grid grid-cols-1 gap-3 py-8 md:grid-cols-[8rem_1fr]">
              <div>
                <Mono className="text-[11px] uppercase tracking-[0.12em] text-accent">
                  {CADENCE_LABEL[item.cadence]}
                </Mono>
                <p className="mt-2 font-sans text-[14px] text-text-subtle">
                  {item.when}
                </p>
              </div>
              <div>
                <p className="font-serif text-[20px] font-semibold leading-snug text-foreground">
                  {item.what}
                </p>
                {item.rationale && (
                  <Body className="mt-3 max-w-2xl text-[16px] leading-[1.65] text-text-subtle">
                    {item.rationale}
                  </Body>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
