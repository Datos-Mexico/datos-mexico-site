"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { INDICADORES, type IndicadorId, type IndicadorMapa } from "./indicadores-datos";
import { COPY, GRUPOS_PREGUNTA, ORDEN_CANON, type GrupoPregunta } from "./indicadores-copy";

/**
 * Selector del canon: diez indicadores en dos columnas, agrupados por las
 * preguntas editoriales (¿De qué se vive? / ¿Cómo se vive?). El nombre es
 * el de la capa humana; el valor nacional y el periodo, a la derecha en
 * registro técnico. Interacción primaria: hover con puntero fino repinta
 * el mapa en vivo; al salir de la lista queda el último indicador. Sin
 * clicks ni cursor pointer. La lista es contenido legible para lector de
 * pantalla; teclado sigue en el pendiente global.
 */
const POR_ID = new Map<IndicadorId, IndicadorMapa>(INDICADORES.map((i) => [i.id, i]));

export function IndicadorSelector({
  activo,
  onActivar,
}: {
  activo: IndicadorId;
  onActivar: (id: IndicadorId) => void;
}) {
  const alEntrar = (id: IndicadorId) => (e: ReactPointerEvent<HTMLLIElement>) => {
    if (e.pointerType === "mouse") onActivar(id);
  };

  const grupo = (g: GrupoPregunta) => (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {GRUPOS_PREGUNTA[g]}
      </p>
      <ul className="mt-1.5">
        {ORDEN_CANON[g].map((id) => {
          const ind = POR_ID.get(id);
          if (!ind) return null;
          return (
            <li
              key={id}
              onPointerEnter={alEntrar(id)}
              className={`flex items-baseline justify-between gap-3 border-l-2 py-[3px] pl-2.5 pr-1 transition-colors ${
                id === activo ? "border-primary bg-muted/40" : "border-transparent"
              }`}
            >
              <span className="font-sans text-[13px] leading-tight text-foreground">
                {COPY[id].nombreHumano}
              </span>
              <span className="whitespace-nowrap font-mono text-[11px] text-text-subtle">
                {ind.valorNacionalFmt} · {ind.periodo}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div className="mt-6 hidden lg:grid lg:grid-cols-2 lg:gap-x-8">
      {grupo("vive-de")}
      {grupo("vive-como")}
    </div>
  );
}
