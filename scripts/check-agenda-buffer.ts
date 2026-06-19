/**
 * Verifica que el registry de la agenda mantenga al menos N semanas futuras
 * desde la fecha actual. Falla con exit code 1 si no las hay — diseñado para
 * que CI/prebuild capture el "se nos acabó la agenda" antes de un deploy.
 *
 * Se ejecuta en `predev` y `prebuild` (ver package.json). Para correrlo a
 * mano: `npx tsx scripts/check-agenda-buffer.ts`.
 *
 * Reglas:
 *  - "Semana futura" = semana cuyo `endDate` es estrictamente mayor que hoy
 *    (en UTC). Se cuenta la semana en curso si todavía no ha cerrado.
 *  - Umbral mínimo: BUFFER_MIN (4). Se puede sobreescribir con la variable
 *    de entorno AGENDA_BUFFER_MIN si alguna vez quisiéramos ser más estrictos.
 */

import { weeks } from "../lib/agenda/registry";

const BUFFER_MIN = Number(process.env.AGENDA_BUFFER_MIN ?? 4);

function toUTC(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

function todayUTC(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

function main(): void {
  const today = todayUTC();
  const future = weeks.filter((w) => toUTC(w.endDate) >= today);

  // Orden estable para reportar
  const sorted = [...future].sort((a, b) =>
    a.startDate.localeCompare(b.startDate),
  );

  const ok = sorted.length >= BUFFER_MIN;

  const isoToday = today.toISOString().slice(0, 10);
  console.log(`[check-agenda-buffer] hoy: ${isoToday}`);
  console.log(
    `[check-agenda-buffer] semanas futuras (endDate >= hoy): ${sorted.length}`,
  );
  console.log(`[check-agenda-buffer] umbral mínimo: ${BUFFER_MIN}`);

  if (sorted.length > 0) {
    const last = sorted[sorted.length - 1];
    console.log(
      `[check-agenda-buffer] última semana cargada: ${last.isoWeek} (${last.startDate} → ${last.endDate})`,
    );
  }

  if (!ok) {
    console.error("");
    console.error(
      `[check-agenda-buffer] FAIL — la agenda tiene ${sorted.length} semana(s) futura(s); se requieren ${BUFFER_MIN}.`,
    );
    console.error(
      "[check-agenda-buffer] Crea los archivos faltantes en lib/agenda/weeks/ y agrégalos a lib/agenda/registry.ts.",
    );
    console.error(
      "[check-agenda-buffer] Usa lib/agenda/weeks/_TEMPLATE.ts como base.",
    );
    process.exit(1);
  }

  console.log("[check-agenda-buffer] OK");
}

main();
