"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ESTADOS, MAPA_VIEWBOX, type ClaveEntidad } from "./estados-geometria";
import "./hero-mapa.css";

/**
 * Mapa de la República por entidad federativa para el hero de la home.
 *
 * Interacción por hover con puntero fino, solo escritorio; en touch el mapa
 * es una figura estática. Sin clicks: los estados no son destinos todavía.
 *
 * - Modo esqueleto (sin props): fill muted uniforme y hover a primary.
 * - Modo coropleta (`fills`): cada entidad pinta su quintil; el hover no
 *   pisa el fill — un path de contorno superpuesto (último nodo del svg,
 *   inmune a la oclusión por vecinos posteriores en el orden del documento)
 *   marca el estado activo con stroke de foreground.
 * - Tooltip: nombre corto y, con `detalles`, el valor formateado con unidad
 *   y periodo. El nombre vive en estado de React (un render al entrar/salir
 *   de cada estado); la posición se escribe directo al style del ref en
 *   pointermove, sin re-renders por movimiento.
 * - Accesibilidad: role="img" con etiqueta general; cada path lleva
 *   aria-label con el nombre oficial INEGI y, con `detalles`, el valor del
 *   indicador activo. Navegación por teclado: pendiente global registrado.
 */
export interface DetalleEntidad {
  linea: string; // tooltip: "62.4 % de la población ocupada · 1T 2026"
  aria: string; // "62.4 % de la población ocupada, 1T 2026"
}

const POR_CLAVE = new Map(ESTADOS.map((e) => [e.clave, e]));

export function HeroMapaMexico({
  fills,
  detalles,
}: {
  fills?: Partial<Record<ClaveEntidad, string>>;
  detalles?: Record<ClaveEntidad, DetalleEntidad>;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<ClaveEntidad | null>(null);

  const claveDe = (target: EventTarget): ClaveEntidad | null =>
    target instanceof SVGPathElement && target.dataset.clave
      ? (target.dataset.clave as ClaveEntidad)
      : null;

  const onPointerOver = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (e.pointerType !== "mouse") return;
    setHovered(claveDe(e.target));
  };

  const onPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const root = rootRef.current;
    const tip = tooltipRef.current;
    if (!root || !tip || e.pointerType !== "mouse") return;
    const r = root.getBoundingClientRect();
    const x = Math.min(e.clientX - r.left + 14, r.width - tip.offsetWidth - 4);
    const y = e.clientY - r.top + 18;
    tip.style.transform = `translate(${Math.max(x, 4)}px, ${y}px)`;
  };

  const onPointerLeave = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (e.pointerType !== "mouse") return;
    setHovered(null);
  };

  const activo = hovered ? POR_CLAVE.get(hovered) : undefined;

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
              detalles
                ? `${estado.nombreOficial}: ${detalles[estado.clave].aria}`
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
        className={`pointer-events-none absolute left-0 top-0 z-10 rounded border border-border bg-background px-2.5 py-1.5 shadow-sm transition-opacity duration-150 motion-reduce:transition-none ${
          activo ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="block whitespace-nowrap font-sans text-[13px] font-medium leading-tight text-foreground">
          {activo?.nombreCorto}
        </span>
        {activo && detalles && (
          <span className="mt-0.5 block whitespace-nowrap font-mono text-[12px] leading-tight text-text-subtle">
            {detalles[activo.clave].linea}
          </span>
        )}
      </div>
    </div>
  );
}
