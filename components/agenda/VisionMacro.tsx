import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Body, Mono } from "@/components/typography";
import { cn } from "@/lib/utils";
import type { MacroMilestone } from "@/lib/agenda/types";
import { formatLongDate } from "./format";

const KIND_LABEL: Record<MacroMilestone["kind"], string> = {
  event: "Evento",
  deadline: "Entrega",
  cycle: "Ciclo",
  competition: "Concurso",
  presentation: "Presentación",
};

const STATUS_LABEL: Record<MacroMilestone["status"], string> = {
  planned: "Planificado",
  confirmed: "Confirmado",
  tentative: "Tentativo",
  done: "Cerrado",
};

const STATUS_CLASS: Record<MacroMilestone["status"], string> = {
  planned: "border-border bg-muted text-text-subtle",
  confirmed: "border-primary/30 bg-primary/10 text-primary",
  tentative: "border-warning/30 bg-warning/10 text-warning",
  done: "border-border bg-muted text-text-subtle",
};

export function VisionMacro({
  milestones,
}: {
  milestones: readonly MacroMilestone[];
}) {
  return (
    <section
      id="macro"
      aria-label="Visión macro trimestral y anual"
      className="border-b border-border py-20 md:py-24"
    >
      <Container>
        <SectionHeader
          eyebrow="Visión macro"
          title="Hitos institucionales y exposición pública."
          lead="Los compromisos públicos del observatorio en el horizonte trimestral y anual. La lista se mantiene corta a propósito: incluimos únicamente lo confirmado y declaramos como tentativo lo que aún no lo está."
        />

        <ol className="mt-14 relative">
          <div
            aria-hidden="true"
            className="absolute left-3 top-0 hidden h-full w-px bg-border md:block"
          />
          {milestones.length === 0 ? (
            <li className="rounded-lg border border-dashed border-border bg-muted/40 px-6 py-8">
              <Body className="text-[15px] text-text-subtle">
                Sin hitos macro publicados.
              </Body>
            </li>
          ) : (
            milestones.map((m) => (
              <li
                key={m.id}
                className="relative grid grid-cols-1 gap-3 pb-12 last:pb-0 md:grid-cols-[10rem_1fr] md:gap-8 md:pl-12"
              >
                <span
                  aria-hidden="true"
                  className="absolute left-[5px] top-[10px] hidden h-2.5 w-2.5 rounded-full bg-primary md:block"
                />
                <div>
                  <Mono className="text-[11px] uppercase tracking-[0.12em] text-accent">
                    {KIND_LABEL[m.kind]}
                  </Mono>
                  <p className="mt-2 font-serif text-[17px] font-semibold text-foreground">
                    {formatLongDate(m.date)}
                  </p>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-serif text-[22px] font-semibold leading-tight text-foreground md:text-[24px]">
                      {m.title}
                    </p>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.08em]",
                        STATUS_CLASS[m.status],
                      )}
                    >
                      {STATUS_LABEL[m.status]}
                    </span>
                  </div>
                  <Body className="mt-3 max-w-2xl text-[16px] leading-[1.65] text-text-subtle">
                    {m.description}
                  </Body>
                </div>
              </li>
            ))
          )}
        </ol>
      </Container>
    </section>
  );
}
