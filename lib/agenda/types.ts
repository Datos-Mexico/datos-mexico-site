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
