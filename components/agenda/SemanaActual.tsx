import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Body, Mono, Small } from "@/components/typography";
import { ExternalLinkIcon } from "@/components/ui/ExternalLinkIcon";
import type { AgendaEvent, AgendaWeek } from "@/lib/agenda/types";
import { cn } from "@/lib/utils";
import { formatLongDate, formatWeekRange } from "./format";

const TYPE_LABEL: Record<AgendaEvent["type"], string> = {
  publication: "Publicación",
  meeting: "Junta",
  session: "Sesión",
  presentation: "Presentación",
  deadline: "Entrega",
  milestone: "Hito",
};

function groupByDate(events: readonly AgendaEvent[]) {
  const map = new Map<string, AgendaEvent[]>();
  for (const e of events) {
    const list = map.get(e.date) ?? [];
    list.push(e);
    map.set(e.date, list);
  }
  return [...map.entries()]
    .map(([date, items]) => ({
      date,
      items: [...items].sort((a, b) => (a.time ?? "").localeCompare(b.time ?? "")),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function NavLink({
  week,
  direction,
}: {
  week: AgendaWeek | undefined;
  direction: "prev" | "next";
}) {
  if (!week) {
    return (
      <span
        aria-disabled="true"
        className="inline-flex items-center gap-2 font-sans text-[14px] text-text-subtle opacity-40"
      >
        {direction === "prev" ? (
          <>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Semana anterior
          </>
        ) : (
          <>
            Semana siguiente <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </>
        )}
      </span>
    );
  }
  return (
    <Link
      href={`/agenda?w=${week.isoWeek}#semana`}
      className="inline-flex items-center gap-2 font-sans text-[14px] font-medium text-foreground transition-colors hover:text-primary"
    >
      {direction === "prev" ? (
        <>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span>{week.isoWeek}</span>
        </>
      ) : (
        <>
          <span>{week.isoWeek}</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </>
      )}
    </Link>
  );
}

function EventRow({ event }: { event: AgendaEvent }) {
  const isExternal = event.link?.external || (event.link && /^https?:\/\//.test(event.link.href));
  return (
    <li className="flex flex-col gap-2 border-b border-border py-5 last:border-b-0 md:flex-row md:items-start md:gap-6">
      <div className="flex w-full items-center gap-3 md:w-44 md:flex-col md:items-start md:gap-1">
        <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.08em] text-text-subtle">
          {TYPE_LABEL[event.type]}
        </span>
        {event.time && <Mono className="text-[13px]">{event.time}</Mono>}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-sans text-[16px] font-medium leading-snug text-foreground md:text-[17px]">
          {event.title}
        </p>
        {event.description && (
          <Body className="mt-2 text-[15px] leading-[1.6] text-text-subtle">
            {event.description}
          </Body>
        )}
        {event.link && (
          <Link
            href={event.link.href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="mt-2 inline-flex items-center gap-1 font-sans text-[14px] font-medium text-primary hover:underline"
          >
            <span>{event.link.label}</span>
            {isExternal && <ExternalLinkIcon className="text-primary" />}
          </Link>
        )}
      </div>
    </li>
  );
}

export function SemanaActual({
  week,
  prev,
  next,
}: {
  week: AgendaWeek;
  prev: AgendaWeek | undefined;
  next: AgendaWeek | undefined;
}) {
  const groups = groupByDate(week.events);
  const hasEvents = week.events.length > 0;

  return (
    <section
      id="semana"
      aria-label="Agenda semanal detallada"
      className="border-b border-border py-20 md:py-24"
    >
      <Container>
        <SectionHeader
          eyebrow="Semana en curso"
          title="Agenda semanal detallada."
          lead="Publicaciones planificadas, junta operativa del equipo y sesiones de trabajo de la semana ISO seleccionada."
        />

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 md:flex-row md:items-baseline md:justify-between">
          <div>
            <Mono className="text-[13px] text-accent">{week.isoWeek}</Mono>
            <p className="mt-1 font-serif text-[22px] font-semibold leading-tight text-foreground md:text-[26px]">
              {formatWeekRange(week.startDate, week.endDate)}
            </p>
            {week.theme && (
              <Small className="mt-2 text-text-subtle">
                Tema de la semana: <span className="text-foreground">{week.theme}</span>
              </Small>
            )}
          </div>
          <nav
            aria-label="Navegación entre semanas"
            className="flex items-center gap-6"
          >
            <NavLink week={prev} direction="prev" />
            <NavLink week={next} direction="next" />
          </nav>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_18rem]">
          <div className="min-w-0">
            <h3 className="font-serif text-[18px] font-semibold text-foreground">
              Publicaciones y sesiones de la semana
            </h3>

            {hasEvents ? (
              <div className="mt-6 space-y-10">
                {groups.map((g) => (
                  <div key={g.date}>
                    <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-text-subtle">
                      {formatLongDate(g.date)}
                    </p>
                    <ul className="mt-3">
                      {g.items.map((e) => (
                        <EventRow key={e.id} event={e} />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={cn(
                  "mt-6 rounded-lg border border-dashed border-border bg-muted/40 px-6 py-8",
                )}
              >
                <Body className="text-[15px] leading-[1.65] text-text-subtle">
                  Esta semana aún no tiene publicaciones planificadas confirmadas.
                  La planificación detallada se publica con anticipación de algunos
                  días.
                </Body>
              </div>
            )}

            {week.notes && (
              <div className="mt-10 border-l-2 border-accent pl-5">
                <Body className="text-[15px] leading-[1.7] text-text">
                  {week.notes}
                </Body>
              </div>
            )}
          </div>

          <aside aria-label="Junta operativa de la semana">
            <div className="sticky top-24 rounded-lg border border-border bg-muted/50 px-6 py-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-subtle">
                Junta operativa
              </p>
              <p className="mt-2 font-serif text-[18px] font-semibold text-foreground">
                {formatLongDate(week.weeklyMeeting.date)}
              </p>
              <p className="mt-1 font-sans text-[14px] text-text-subtle">
                {week.weeklyMeeting.time} h
              </p>
              {week.weeklyMeeting.agenda.length > 0 ? (
                <ul className="mt-5 space-y-2">
                  {week.weeklyMeeting.agenda.map((item) => (
                    <li
                      key={item}
                      className="font-sans text-[14px] leading-[1.55] text-text"
                    >
                      — {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 font-sans text-[13px] italic leading-[1.55] text-text-subtle">
                  Orden del día por confirmar.
                </p>
              )}
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
