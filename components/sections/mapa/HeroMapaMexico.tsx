"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ESTADOS, MAPA_VIEWBOX, type ClaveEntidad } from "./estados-geometria";
import "./hero-mapa.css";

/**
 * Mapa de la República por entidad federativa para el hero de la home.
 *
 * Fase de esqueleto geográfico: sin datos, sin navegación. La única
 * interacción es hover con puntero fino — resalte del estado (CSS puro) y
 * tooltip con el nombre corto. En touch el mapa es una figura estática.
 *
 * - Tooltip: el nombre vive en estado de React (un render al entrar/salir
 *   de cada estado); la posición se escribe directo al style vía rAF-less
 *   pointermove sobre un ref, sin re-renders por movimiento.
 * - Accesibilidad: role="img" con etiqueta general; cada path lleva
 *   aria-label con el nombre oficial INEGI. La navegación por teclado
 *   queda para la fase de datos, cuando el foco tenga destino.
 * - Coropletas futuras: pasar `fills` (clave → color) pinta cada entidad
 *   sin tocar la estructura.
 */
export function HeroMapaMexico({
  fills,
}: {
  fills?: Partial<Record<ClaveEntidad, string>>;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [nombre, setNombre] = useState<string | null>(null);

  const nombreDe = (target: EventTarget): string | null =>
    target instanceof SVGPathElement ? (target.dataset.nombre ?? null) : null;

  const onPointerOver = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (e.pointerType !== "mouse") return;
    setNombre(nombreDe(e.target));
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
    setNombre(null);
  };

  return (
    <div ref={rootRef} className="relative">
      <svg
        className="mapa-mx"
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
            aria-label={estado.nombreOficial}
            style={fills?.[estado.clave] ? { fill: fills[estado.clave] } : undefined}
          />
        ))}
      </svg>
      <div
        ref={tooltipRef}
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-0 z-10 whitespace-nowrap rounded border border-border bg-background px-2.5 py-1 font-sans text-[13px] font-medium text-foreground shadow-sm transition-opacity duration-150 motion-reduce:transition-none ${
          nombre ? "opacity-100" : "opacity-0"
        }`}
      >
        {nombre}
      </div>
    </div>
  );
}
