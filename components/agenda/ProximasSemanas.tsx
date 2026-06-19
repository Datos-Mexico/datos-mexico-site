import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Body, Mono, Small } from "@/components/typography";
import type { AgendaEvent, AgendaWeek } from "@/lib/agenda/types";
import { formatWeekRange } from "./format";

const TYPE_LABEL: Record<AgendaEvent["type"], string> = {
  publication: "Publicación",
  meeting: "Junta",
  session: "Sesión",
  presentation: "Presentación",
  deadline: "Entrega",
  milestone: "Hito",
  "press-engagement": "Encargo de prensa",
};

function visibleEvents(week: AgendaWeek): readonly AgendaEvent[] {
  return week.events.filter(
    (e) => e.prominence !== "omit" && e.status !== "cancelled",
  );
}

function WeekCard({ week }: { week: AgendaWeek }) {
  const events = visibleEvents(week);
  const hasEvents = events.length > 0;
  return (
    <li>
      <Link
        href={`/agenda?w=${week.isoWeek}#semana`}
        className="group block rounded-lg border border-border bg-muted/30 px-6 py-6 transition-colors hover:border-foreground/30 hover:bg-muted/60 md:px-8 md:py-7"
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
          <div>
            <Mono className="text-[12px] text-accent">{week.isoWeek}</Mono>
            <p className="mt-1 font-serif text-[18px] font-semibold leading-tight text-foreground md:text-[20px]">
              {formatWeekRange(week.startDate, week.endDate)}
            </p>
            {week.theme && (
              <Small className="mt-1 text-text-subtle">{week.theme}</Small>
            )}
          </div>
          <span className="inline-flex items-center gap-1.5 font-sans text-[13px] font-medium text-text-subtle transition-colors group-hover:text-foreground">
            Ver semana
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </div>

        {hasEvents ? (
          <ul className="mt-5 space-y-2.5">
            {events.map((e) => (
              <li
                key={e.id}
                className="flex items-baseline gap-3 font-sans text-[14px] leading-[1.55] text-text md:text-[15px]"
              >
                <span className="inline-flex w-28 flex-shrink-0 items-center rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-text-subtle">
                  {TYPE_LABEL[e.type]}
                </span>
                <span className="min-w-0 flex-1 truncate">{e.title}</span>
              </li>
            ))}
          </ul>
        ) : (
          <Body className="mt-4 text-[14px] italic leading-[1.55] text-text-subtle">
            Sin publicaciones confirmadas todavía.
          </Body>
        )}
      </Link>
    </li>
  );
}

export function ProximasSemanas({ weeks }: { weeks: readonly AgendaWeek[] }) {
  if (weeks.length === 0) return null;
  return (
    <section
      id="proximas-semanas"
      aria-label="Próximas semanas de la agenda"
      className="border-b border-border py-20 md:py-24"
    >
      <Container>
        <SectionHeader
          eyebrow="Próximas semanas"
          title="Lo que viene en las siguientes semanas."
          lead="Vista compacta de las semanas que siguen a la semana en curso. Haz clic en cualquiera para ver el detalle completo."
        />

        <ul className="mt-10 grid grid-cols-1 gap-4">
          {weeks.map((w) => (
            <WeekCard key={w.isoWeek} week={w} />
          ))}
        </ul>
      </Container>
    </section>
  );
}
