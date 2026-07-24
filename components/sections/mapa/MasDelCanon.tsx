"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import type { IndicadorId } from "./indicadores-datos";
import { COPY } from "./indicadores-copy";
import { MAS_DEL_CANON } from "./vistas";

/**
 * Fila de transición F3→F4: los indicadores del canon que aún no tienen
 * vista propia siguen accesibles aquí con el mismo hover-que-repinta (el
 * bloque del pintado y la frase los describen al pintarlos). Cada ola que
 * estrena su vista se lleva los suyos; la fila desaparece con la última.
 * Vive en la holgura de la columna derecha: costo cero en alturas.
 */
export function MasDelCanon({
  pintado,
  onPintar,
}: {
  pintado: IndicadorId;
  onPintar: (id: IndicadorId) => void;
}) {
  const alEntrar = (id: IndicadorId) => (e: ReactPointerEvent<HTMLLIElement>) => {
    if (e.pointerType === "mouse") onPintar(id);
  };

  return (
    <div className="mt-3 hidden border-t border-border pt-2 lg:block">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        Más del canon
      </p>
      <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
        {MAS_DEL_CANON.map((id) => (
          <li
            key={id}
            onPointerEnter={alEntrar(id)}
            className={`border-b font-mono text-[11px] leading-relaxed transition-colors ${
              id === pintado
                ? "border-primary text-foreground"
                : "border-transparent text-text-subtle"
            }`}
          >
            {COPY[id].nombreHumano}
          </li>
        ))}
      </ul>
    </div>
  );
}
