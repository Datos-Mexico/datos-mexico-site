"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { INDICADORES, type IndicadorId, type IndicadorMapa } from "./indicadores-datos";
import { COPY } from "./indicadores-copy";
import { VISTAS, type VistaCanon } from "./vistas";

/**
 * La vista activa del canon: etiqueta de la vista con los dots del pulso y
 * la lista de sus cinco indicadores — el rey primero, destacado — en dos
 * columnas (3+2). El marcador de "esto es lo pintado" (borde primario +
 * fondo) vive en el item cuyo indicador está en el mapa y se mueve con el
 * hover. Interacción heredada intacta en la lista: hover con puntero fino
 * repinta y queda; sin clicks, sin cursor pointer.
 *
 * Doctrina de los dots (dictamen Ola 2): hover-sin-clicks aplica a los
 * estados del mapa y a los items del selector porque no son destinos; las
 * vistas SÍ son destinos — existen y el pulso mismo navega hacia ellas. Por
 * eso los dots de vistas activas son botones (teclado incluido) que saltan
 * y reinician el reloj; los de vistas sin ola de datos siguen inertes y
 * decorativos: sin cursor pointer, sin promesa rota.
 */
const POR_ID = new Map<IndicadorId, IndicadorMapa>(INDICADORES.map((i) => [i.id, i]));

export function VistaActiva({
  vista,
  pintado,
  onPintar,
  onVista,
}: {
  vista: VistaCanon;
  pintado: IndicadorId;
  onPintar: (id: IndicadorId) => void;
  onVista?: (id: string) => void;
}) {
  const alEntrar = (id: IndicadorId) => (e: ReactPointerEvent<HTMLLIElement>) => {
    if (e.pointerType === "mouse") onPintar(id);
  };

  const ids: IndicadorId[] = vista.rey ? [vista.rey, ...(vista.satelites ?? [])] : [];

  const item = (id: IndicadorId, esRey: boolean) => {
    const ind = POR_ID.get(id);
    if (!ind) return null;
    return (
      <li
        key={id}
        onPointerEnter={alEntrar(id)}
        className={`flex items-baseline justify-between gap-3 border-l-2 py-[3px] pl-2.5 pr-1 transition-colors ${
          id === pintado ? "border-primary bg-muted/40" : "border-transparent"
        }`}
      >
        <span
          className={`font-sans text-[13px] leading-tight text-foreground ${esRey ? "font-semibold" : ""}`}
        >
          {COPY[id].nombreHumano}
        </span>
        <span className="whitespace-nowrap font-mono text-[11px] text-text-subtle">
          {ind.valorNacionalFmt} · {ind.periodo}
        </span>
      </li>
    );
  };

  return (
    <div className="mt-6 hidden lg:block">
      <div className="flex items-center gap-2.5">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {vista.nombre}
        </p>
        <nav
          className="flex items-center gap-[5px]"
          aria-label={`Vistas del canon — vista ${VISTAS.findIndex((v) => v.id === vista.id) + 1} de ${VISTAS.length}: ${vista.nombre}`}
        >
          {VISTAS.map((v) =>
            v.activa && onVista ? (
              <button
                key={v.id}
                type="button"
                title={v.nombre}
                aria-label={`Ver la vista ${v.nombre}`}
                aria-current={v.id === vista.id ? "true" : undefined}
                onClick={() => onVista(v.id)}
                className="group -m-1 grid h-[13px] w-[13px] cursor-pointer place-items-center rounded-full p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
              >
                <span
                  className={`inline-block h-[5px] w-[5px] rounded-full transition-colors ${
                    v.id === vista.id ? "bg-primary" : "bg-text-subtle group-hover:bg-foreground"
                  }`}
                />
              </button>
            ) : (
              <span
                key={v.id}
                title={v.nombre}
                aria-hidden="true"
                className={`inline-block h-[5px] w-[5px] rounded-full ${v.id === vista.id ? "bg-primary" : "bg-border"}`}
              />
            ),
          )}
        </nav>
      </div>
      <ul className="mt-1.5 grid grid-cols-2 gap-x-8">
        {ids.map((id, i) => item(id, i === 0))}
      </ul>
    </div>
  );
}
