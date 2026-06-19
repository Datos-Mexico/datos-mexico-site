/**
 * PLANTILLA — copiar a `lib/agenda/weeks/AAAA-WNN.ts` y agregar al registry
 * en `lib/agenda/registry.ts` (importarla al final del array `weeks`).
 *
 * Reglas del archivo:
 *  - Una semana ISO por archivo. ISO empieza en lunes (W## = ISO week-of-year).
 *  - `startDate` = lunes de la semana; `endDate` = domingo. Formato YYYY-MM-DD.
 *  - Todos los `date` de eventos deben caer dentro del rango de la semana.
 *  - `id` de evento: prefijo con `aaaa-wnn-` para evitar colisiones entre semanas.
 *
 * Reglas del newsletter (importante — la agenda es la fuente de verdad del
 * boletín quincenal; lo que aquí se redacte aparecerá en el correo):
 *  - Idealmente cada semana tiene un evento marcado `prominence: "lead"`
 *    (máximo uno) y entre 1 y 3 con `prominence: "feature"`. El resto se
 *    omite o queda como `"mention"`.
 *  - Cuando el evento ya pasó, edita el archivo y cambia su `status` a
 *    `"happened"` (o `"cancelled"`). Si la realidad difirió del título,
 *    actualízalo. El newsletter se construye con el archivo en el momento
 *    del envío, no con una congelación previa.
 *  - `recap` de la semana se llena DESPUÉS de que la semana cierre. Es lo
 *    que abre la sección de esa semana en el correo. Una o dos oraciones,
 *    voz editorial breve. Si está vacío, el correo abre directo con eventos.
 *  - `newsletterTeaser` solo si la `description` es demasiado larga para
 *    correo. Si la `description` ya es corta (≤2 oraciones), no hace falta.
 */

import type { AgendaWeek } from "../types";

export const week: AgendaWeek = {
  // ISO week — formato AAAA-WNN. NO inventar, calcular de las fechas reales.
  isoWeek: "AAAA-WNN",

  // Lunes y domingo de la semana ISO, formato YYYY-MM-DD.
  startDate: "AAAA-MM-DD",
  endDate: "AAAA-MM-DD",

  // OPCIONAL — Tema/foco editorial prospectivo de la semana. Una frase.
  // Se muestra en la UI y orienta al lector. NO confundir con `recap`.
  // theme: "Foco: cierre del cuaderno de SAR.",

  // OBLIGATORIO — Junta operativa semanal.
  weeklyMeeting: {
    date: "AAAA-MM-DD", // típicamente miércoles
    time: "15:00",      // HH:MM, hora local
    agenda: [
      // Cada bullet es una línea del orden del día. Se puede dejar vacío
      // si la semana aún no se ha planeado en detalle.
    ],
  },

  events: [
    // ───── Plantilla de evento ─────
    // {
    //   id: "aaaa-wnn-slug-corto",
    //   type: "publication",   // publication | meeting | session | presentation | deadline | milestone | press-engagement
    //   date: "AAAA-MM-DD",    // dentro del rango de la semana
    //   time: "11:00",         // OPCIONAL — HH:MM si aplica
    //   title: "Título corto y específico del evento",
    //   description:
    //     "1-3 oraciones de contexto que verá quien abra la página de la agenda. " +
    //     "Si es muy largo para correo, agrega abajo `newsletterTeaser`.",
    //   owner: "Nombre o equipo responsable",  // OPCIONAL
    //   link: {                                 // OPCIONAL
    //     href: "/publicaciones/slug-de-la-pieza",
    //     label: "Leer la pieza",
    //     // external: true,  // solo si href empieza con http(s)
    //   },
    //   publicationSlug: "slug-de-la-pieza",   // OPCIONAL — vincula con /publicaciones/
    //
    //   // ── Campos pensados para el newsletter quincenal ──
    //
    //   status: "planned",        // planned (default) | confirmed | happened | cancelled
    //                             // Cámbialo a "happened" cuando ocurra; a
    //                             // "cancelled" si se cae. El correo retrospectivo
    //                             // lo lee y filtra/adapta.
    //
    //   prominence: "lead",       // lead | feature | mention | omit
    //                             // Máximo UNO "lead" por semana. "omit" excluye
    //                             // del correo (eventos puramente internos).
    //
    //   newsletterTeaser:         // OPCIONAL — versión corta para el correo.
    //     "Una o dos oraciones específicas para email. Si se omite, el correo " +
    //     "usa `description` tal cual.",
    // },
  ],

  // OPCIONAL — Apuntes operativos visibles en la UI. NO se incluyen en el
  // correo (son contexto interno). Para resumen editorial usar `recap`.
  // notes: "La sesión del jueves se cancela; los datos se publican el viernes.",

  // OPCIONAL pero RECOMENDADO POST-SEMANA — Resumen retrospectivo que abre la
  // sección de esta semana en el newsletter quincenal. 1-3 oraciones,
  // voz editorial. Se llena después de que la semana cierra, no en planeación.
  // recap:
  //   "La semana cerró con la publicación de SAR y la primera presentación " +
  //   "ante prensa académica.",
};
