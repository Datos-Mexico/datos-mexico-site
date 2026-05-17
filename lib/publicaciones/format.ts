const monthsEs = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export function formatDateLong(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getUTCDate()} de ${monthsEs[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const month = monthsEs[d.getUTCMonth()];
  return `${d.getUTCDate()} ${month} ${d.getUTCFullYear()}`;
}

export function formatRfc822(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toUTCString();
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} min de lectura`;
}

export function formatHighwireDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}/${m}/${day}`;
}

export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / wordsPerMinute));
}
