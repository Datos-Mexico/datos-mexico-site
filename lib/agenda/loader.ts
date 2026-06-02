import type { AgendaWeek, CadenceItem, MacroMilestone } from "./types";
import { weeks } from "./registry";
import { cadence } from "./cadence";
import { macro } from "./macro";

function toDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

export function getAllWeeks(): readonly AgendaWeek[] {
  return weeks;
}

export function getWeek(isoWeek: string): AgendaWeek | undefined {
  return weeks.find((w) => w.isoWeek === isoWeek);
}

export function getCurrentWeek(now: Date = new Date()): AgendaWeek {
  const t = now.getTime();
  const active = weeks.find((w) => {
    const start = toDate(w.startDate).getTime();
    const end = toDate(w.endDate).getTime() + 24 * 60 * 60 * 1000 - 1;
    return t >= start && t <= end;
  });
  if (active) return active;
  const firstStart = toDate(weeks[0].startDate).getTime();
  if (t < firstStart) return weeks[0];
  return weeks[weeks.length - 1];
}

export function getAdjacentWeeks(isoWeek: string): {
  prev: AgendaWeek | undefined;
  next: AgendaWeek | undefined;
} {
  const idx = weeks.findIndex((w) => w.isoWeek === isoWeek);
  if (idx === -1) return { prev: undefined, next: undefined };
  return {
    prev: idx > 0 ? weeks[idx - 1] : undefined,
    next: idx < weeks.length - 1 ? weeks[idx + 1] : undefined,
  };
}

export function getCadence(): readonly CadenceItem[] {
  return cadence;
}

export function getMacro(): readonly MacroMilestone[] {
  return [...macro].sort(
    (a, b) => toDate(a.date).getTime() - toDate(b.date).getTime(),
  );
}
