import type { Metadata } from "next";
import { AgendaHero } from "@/components/agenda/Hero";
import { SemanaActual } from "@/components/agenda/SemanaActual";
import { ProximasSemanas } from "@/components/agenda/ProximasSemanas";
import { CadenciaOperacional } from "@/components/agenda/CadenciaOperacional";
import { VisionMacro } from "@/components/agenda/VisionMacro";
import { AgendaCierre } from "@/components/agenda/Cierre";
import {
  getAdjacentWeeks,
  getCadence,
  getCurrentWeek,
  getMacro,
  getUpcomingWeeks,
  getWeek,
} from "@/lib/agenda/loader";
import type {
  AgendaEvent,
  AgendaWeek,
  MacroMilestone,
} from "@/lib/agenda/types";

const SITE_URL = "https://datosmexico.org";

export const metadata: Metadata = {
  title: "Agenda",
  description:
    "Cadencia de trabajo y producción del Observatorio Datos México: publicaciones planificadas, sesiones de trabajo y hitos institucionales del semestre en curso.",
  alternates: { canonical: "/agenda" },
  openGraph: {
    title: "Agenda — Datos México",
    description:
      "Publicaciones planificadas, sesiones de trabajo y hitos institucionales del semestre del Observatorio Datos México.",
    url: "/agenda",
    type: "website",
    images: [
      {
        url: "/og/og-default.png",
        width: 1200,
        height: 630,
        alt: "Agenda — Datos México",
      },
    ],
  },
  twitter: {
    title: "Agenda — Datos México",
    description:
      "Cadencia de trabajo y hitos institucionales del Observatorio Datos México.",
    images: ["/og/og-default.png"],
  },
};

const ORG_REF = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Datos México",
  url: SITE_URL,
};

function eventStartDate(e: AgendaEvent): string {
  if (e.time) return `${e.date}T${e.time}:00-06:00`;
  return e.date;
}

function buildPublicEventJsonLd(week: AgendaWeek) {
  const publicTypes: AgendaEvent["type"][] = [
    "publication",
    "session",
    "presentation",
    "press-engagement",
  ];
  return week.events
    .filter((e) => publicTypes.includes(e.type))
    .map((e) => {
      let url: string | undefined;
      if (e.publicationSlug) {
        url = `${SITE_URL}/publicaciones/${e.publicationSlug}`;
      } else if (e.link?.href.startsWith("/")) {
        url = `${SITE_URL}${e.link.href}`;
      } else if (e.link?.external) {
        url = e.link.href;
      }
      return {
        "@context": "https://schema.org",
        "@type": "Event",
        name: e.title,
        description: e.description,
        startDate: eventStartDate(e),
        eventStatus: "https://schema.org/EventScheduled",
        organizer: ORG_REF,
        ...(url && { url }),
      };
    });
}

function buildMacroEventJsonLd(milestones: readonly MacroMilestone[]) {
  const eventKinds: MacroMilestone["kind"][] = [
    "event",
    "presentation",
    "competition",
  ];
  return milestones
    .filter((m) => m.status === "confirmed" && eventKinds.includes(m.kind))
    .map((m) => ({
      "@context": "https://schema.org",
      "@type": "Event",
      name: m.title,
      description: m.description,
      startDate: m.date,
      eventStatus: "https://schema.org/EventScheduled",
      organizer: ORG_REF,
      ...(m.link && { url: m.link.href }),
    }));
}

type Search = { w?: string | string[] };

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const wParam = typeof sp.w === "string" ? sp.w : undefined;
  const requested = wParam ? getWeek(wParam) : undefined;
  const week = requested ?? getCurrentWeek();
  const { prev, next } = getAdjacentWeeks(week.isoWeek);
  const upcoming = getUpcomingWeeks(week.isoWeek, 3);
  const cadence = getCadence();
  const macro = getMacro();

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/agenda#webpage`,
    url: `${SITE_URL}/agenda`,
    name: "Agenda — Datos México",
    description:
      "Cadencia de trabajo y producción del Observatorio Datos México: publicaciones planificadas, sesiones de trabajo y hitos institucionales del semestre en curso.",
    inLanguage: "es-MX",
    isPartOf: {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Datos México",
    },
    publisher: ORG_REF,
  };

  const eventLd = [
    ...buildPublicEventJsonLd(week),
    ...buildMacroEventJsonLd(macro),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      {eventLd.map((ld, i) => (
        <script
          key={`event-ld-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}

      <AgendaHero />
      <SemanaActual week={week} prev={prev} next={next} />
      <ProximasSemanas weeks={upcoming} />
      <CadenciaOperacional items={cadence} />
      <VisionMacro milestones={macro} />
      <AgendaCierre />
    </>
  );
}
