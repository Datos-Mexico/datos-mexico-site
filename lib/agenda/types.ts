export type AgendaEventType =
  | "publication"
  | "meeting"
  | "session"
  | "presentation"
  | "deadline"
  | "milestone"
  | "press-engagement";

export type AgendaEventLink = {
  href: string;
  label: string;
  external?: boolean;
};

/**
 * Estado del evento. Por defecto se asume "planned". Sirve a dos lectores:
 *  - La UI semanal puede etiquetar visualmente lo cancelado o ya ocurrido.
 *  - El newsletter quincenal (que es retrospectivo) puede saltarse lo
 *    "cancelled" y dar peso distinto a "happened" vs lo aún por venir.
 */
export type AgendaEventStatus =
  | "planned"
  | "confirmed"
  | "happened"
  | "cancelled";

/**
 * Peso editorial del evento para el newsletter quincenal.
 *  - "lead":    el principal de la semana. Como máximo uno por semana.
 *  - "feature": importante, va con teaser completo en el correo.
 *  - "mention": entra como bullet corto.
 *  - "omit":    excluir del correo (evento operativo interno).
 * Si está ausente, el agregador trata el evento como "mention".
 */
export type AgendaEventProminence = "lead" | "feature" | "mention" | "omit";

export type AgendaEvent = {
  id: string;
  type: AgendaEventType;
  date: string;
  time?: string;
  title: string;
  description?: string;
  owner?: string;
  link?: AgendaEventLink;
  publicationSlug?: string;
  /**
   * Estado del evento. Si se omite, equivale a "planned".
   * Lo establece el equipo cuando edita la semana después de que algo
   * ocurrió/cambió. Permite que el newsletter retrospectivo distinga.
   */
  status?: AgendaEventStatus;
  /**
   * Peso editorial para el newsletter. Si se omite, equivale a "mention".
   * "omit" excluye del correo (útil para eventos operativos internos).
   */
  prominence?: AgendaEventProminence;
  /**
   * Versión corta del evento (1-2 oraciones) optimizada para correo.
   * Si se omite, el agregador del newsletter usa `description` como
   * fallback. Existe porque las descripciones de la agenda suelen tener
   * más contexto del que cabe en un boletín.
   */
  newsletterTeaser?: string;
};

export type WeeklyMeeting = {
  date: string;
  time: string;
  agenda: readonly string[];
};

export type AgendaWeek = {
  isoWeek: string;
  startDate: string;
  endDate: string;
  theme?: string;
  weeklyMeeting: WeeklyMeeting;
  events: readonly AgendaEvent[];
  notes?: string;
  /**
   * Resumen retrospectivo de la semana (1-3 oraciones), escrito por el
   * equipo DESPUÉS de que la semana termina. El newsletter quincenal lo
   * usa como párrafo de apertura para la sección de esa semana.
   *
   * No es lo mismo que `theme` (mirada hacia adelante) ni que `notes`
   * (apuntes operativos). Es la voz editorial que cierra la semana.
   */
  recap?: string;
};

export type CadenceFrequency = "daily" | "weekly" | "monthly";

export type CadenceItem = {
  id: string;
  cadence: CadenceFrequency;
  what: string;
  when: string;
  where?: string;
  rationale?: string;
};

export type MacroMilestoneKind =
  | "event"
  | "deadline"
  | "cycle"
  | "competition"
  | "presentation";

export type MacroMilestoneStatus =
  | "planned"
  | "confirmed"
  | "tentative"
  | "done";

export type MacroMilestone = {
  id: string;
  date: string;
  kind: MacroMilestoneKind;
  title: string;
  description: string;
  status: MacroMilestoneStatus;
  link?: AgendaEventLink;
};
