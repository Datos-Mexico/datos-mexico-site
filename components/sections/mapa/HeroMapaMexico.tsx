"use client";

import { useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ESTADOS, MAPA_VIEWBOX, type ClaveEntidad } from "./estados-geometria";
import "./hero-mapa.css";

/**
 * Mapa de la República por entidad federativa para el hero de la home.
 *
 * Interacción por hover con puntero fino, solo escritorio; en touch el mapa
 * es una figura estática. Sin clicks: los estados no son destinos todavía.
 *
 * - Modo esqueleto (sin props): fill muted uniforme y hover a primary.
 * - Modo coropleta (`fills`): cada entidad pinta su quintil; el hover se
 *   marca con un path de contorno superpuesto (último nodo del svg, inmune
 *   a la oclusión por vecinos posteriores), sin pisar el color del dato.
 * - Mini-ficha de estado (F4): el hover muestra los datos de la vista para
 *   ese estado — lo pintado en el slot del rey (valor grande) y los demás
 *   en retícula 2×2. Anclada al cursor (+14/+18) con volteo en ambos ejes
 *   para no salirse del viewport ni tapar el punto activo; aria-hidden —
 *   el aria de cada path lleva el dato pintado (regla del registro dual).
 * - El nombre del estado activo vive en estado de React (un render por
 *   entrada/salida); la posición se escribe directo al style del ref en
 *   pointermove, sin re-renders por movimiento.
 * - Accesibilidad: role="img" general; cada path con aria-label del nombre
 *   oficial INEGI y el valor pintado. Teclado: pendiente global registrado.
 */
export interface FichaEntidad {
  aria: string; // línea humanizada del dato pintado, para el aria del path
  rey: { valor: string; label: string; periodo: string };
  satelites: { valor: string; label: string }[];
}

const POR_CLAVE = new Map(ESTADOS.map((e) => [e.clave, e]));

export function HeroMapaMexico({
  fills,
  fichas,
}: {
  fills?: Partial<Record<ClaveEntidad, string>>;
  fichas?: Record<ClaveEntidad, FichaEntidad>;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<{ x: number; y: number } | null>(null);
  const [hovered, setHovered] = useState<ClaveEntidad | null>(null);

  const claveDe = (target: EventTarget): ClaveEntidad | null =>
    target instanceof SVGPathElement && target.dataset.clave
      ? (target.dataset.clave as ClaveEntidad)
      : null;

  const onPointerOver = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (e.pointerType !== "mouse") return;
    setHovered(claveDe(e.target));
  };

  // Ancla al cursor con volteo: X salta a la izquierda si no cabe a la
  // derecha del contenedor; Y salta arriba si la ficha se saldría del
  // viewport. Nunca queda bajo el cursor.
  const posiciona = (cx: number, cy: number) => {
    const root = rootRef.current;
    const tip = tooltipRef.current;
    if (!root || !tip) return;
    const r = root.getBoundingClientRect();
    const w = tip.offsetWidth;
    const h = tip.offsetHeight;
    let x = cx - r.left + 14;
    if (x + w > r.width - 4) x = cx - r.left - w - 14;
    let y = cy - r.top + 18;
    if (cy + 18 + h > window.innerHeight - 8) y = cy - r.top - h - 12;
    tip.style.transform = `translate(${Math.max(x, 4)}px, ${y}px)`;
  };

  const onPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (e.pointerType !== "mouse") return;
    cursorRef.current = { x: e.clientX, y: e.clientY };
    posiciona(e.clientX, e.clientY);
  };

  // Al cambiar de estado la ficha re-renderiza y sus dimensiones cambian:
  // se reposiciona con las medidas frescas para que el volteo actúe desde
  // la primera entrada (no hasta el siguiente movimiento del cursor).
  useLayoutEffect(() => {
    if (hovered && cursorRef.current) posiciona(cursorRef.current.x, cursorRef.current.y);
  });

  const onPointerLeave = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (e.pointerType !== "mouse") return;
    setHovered(null);
  };

  const activo = hovered ? POR_CLAVE.get(hovered) : undefined;
  const ficha = activo && fichas ? fichas[activo.clave] : undefined;

  return (
    <div ref={rootRef} className="relative">
      <svg
        className={fills ? "mapa-mx mapa-mx--coropleta" : "mapa-mx"}
        viewBox={MAPA_VIEWBOX}
        role="img"
        aria-label="Mapa de México dividido en sus 32 entidades federativas"
        onPointerOver={onPointerOver}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        {ESTADOS.map((estado) => (
          <path
            key={estado.clave}
            id={`ent-${estado.clave}`}
            className="mapa-mx__estado"
            d={estado.d}
            data-clave={estado.clave}
            data-nombre={estado.nombreCorto}
            role="img"
            aria-label={
              fichas
                ? `${estado.nombreOficial}: ${fichas[estado.clave].aria}`
                : estado.nombreOficial
            }
            style={fills?.[estado.clave] ? { fill: fills[estado.clave] } : undefined}
          />
        ))}
        {fills && activo && (
          <path className="mapa-mx__contorno" d={activo.d} aria-hidden="true" />
        )}
      </svg>
      <div
        ref={tooltipRef}
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-0 z-10 w-[290px] rounded border border-border bg-background px-3.5 py-3 shadow-sm transition-opacity duration-150 motion-reduce:transition-none ${
          activo ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="block font-sans text-[13px] font-semibold leading-tight text-foreground">
          {activo?.nombreCorto}
        </span>
        {ficha && (
          <>
            <span className="mt-1.5 block font-mono text-[19px] font-semibold leading-none text-foreground">
              {ficha.rey.valor}
            </span>
            <span className="mb-2.5 mt-0.5 block font-sans text-[11px] leading-tight text-text-subtle">
              {ficha.rey.label} · {ficha.rey.periodo}
            </span>
            <span className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-2.5">
              {ficha.satelites.map((s) => (
                <span key={s.label} className="block">
                  <span className="block font-mono text-[12px] font-medium leading-tight text-foreground">
                    {s.valor}
                  </span>
                  <span className="mt-px block font-sans text-[10px] leading-tight text-text-subtle">
                    {s.label}
                  </span>
                </span>
              ))}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
