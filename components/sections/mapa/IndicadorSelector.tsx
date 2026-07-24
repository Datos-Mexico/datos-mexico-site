"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { GRUPOS, INDICADORES, type IndicadorId, type IndicadorMapa } from "./indicadores-datos";

/**
 * Lista sobria de los seis indicadores de la coropleta, en dos grupos.
 * Interacción primaria: hover con puntero fino repinta el mapa en vivo; al
 * salir de la lista queda el último indicador (sin volver al default, menos
 * parpadeo). Sin clicks ni cursor pointer: no hay promesa de navegación.
 * La lista es contenido legible para lector de pantalla (nombre, valor
 * nacional y periodo por item); teclado queda en el pendiente global.
 */
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

  const grupo = (g: IndicadorMapa["grupo"], extra?: string) => (
    <div className={extra}>
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {GRUPOS[g]}
      </p>
      <ul className="mt-1.5">
        {INDICADORES.filter((i) => i.grupo === g).map((ind) => (
          <li
            key={ind.id}
            onPointerEnter={alEntrar(ind.id)}
            className={`flex items-baseline justify-between gap-3 border-l-2 py-[5px] pl-2.5 pr-1 transition-colors ${
              ind.id === activo ? "border-primary bg-muted/40" : "border-transparent"
            }`}
          >
            <span className="font-sans text-[13px] leading-tight text-foreground">
              {ind.nombre}
            </span>
            <span className="whitespace-nowrap font-mono text-[11px] text-text-subtle">
              {ind.valorNacionalFmt} · {ind.periodo}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="mt-8 hidden lg:grid lg:grid-cols-2 lg:gap-x-8">
      {grupo("laboral")}
      {grupo("panorama")}
    </div>
  );
}
