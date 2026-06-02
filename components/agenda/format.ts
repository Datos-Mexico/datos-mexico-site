const longDate = new Intl.DateTimeFormat("es-MX", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

const dayMonth = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

const monthYear = new Intl.DateTimeFormat("es-MX", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function toUTCDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
}

export function formatLongDate(iso: string): string {
  return capitalize(longDate.format(toUTCDate(iso)));
}

export function formatDayMonth(iso: string): string {
  return dayMonth.format(toUTCDate(iso));
}

export function formatMonthYear(iso: string): string {
  return capitalize(monthYear.format(toUTCDate(iso)));
}

export function formatWeekRange(startISO: string, endISO: string): string {
  return `${formatDayMonth(startISO)} – ${formatDayMonth(endISO)}`;
}
