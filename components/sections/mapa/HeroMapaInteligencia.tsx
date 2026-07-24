"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ESTADOS, type ClaveEntidad } from "./estados-geometria";
import {
  INDICADORES,
  INDICADOR_DEFAULT,
  type IndicadorId,
} from "./indicadores-datos";
import { QUINTIL_FILLS } from "./rampa";
import { HeroMapaMexico, type DetalleEntidad } from "./HeroMapaMexico";
import { IndicadorSelector } from "./IndicadorSelector";
import { LeyendaQuintiles } from "./LeyendaQuintiles";

/**
 * Contenedor de la capa de inteligencia del hero: el grid split (mensaje a
 * la izquierda con el selector de indicadores debajo; coropleta con leyenda
 * y cita a la derecha) y el único estado compartido — el indicador activo.
 *
 * El mensaje llega como children server-rendered: este componente no toca
 * su contenido. Cambiar de indicador es un render (los 32 fills nuevos
 * animan por CSS); el movimiento del cursor nunca re-renderiza (patrón del
 * mapa). En móvil no hay selector: coropleta estática del indicador por
 * defecto con su leyenda y su cita.
 */
export function HeroMapaInteligencia({ mensaje }: { mensaje: ReactNode }) {
  const [activoId, setActivoId] = useState<IndicadorId>(INDICADOR_DEFAULT);
  const activo = INDICADORES.find((i) => i.id === activoId) ?? INDICADORES[0];

  const { fills, detalles } = useMemo(() => {
    const fills: Partial<Record<ClaveEntidad, string>> = {};
    const detalles = {} as Record<ClaveEntidad, DetalleEntidad>;
    for (const e of ESTADOS) {
      const c = e.clave;
      fills[c] = QUINTIL_FILLS[activo.quintil[c] - 1];
      const cuerpo = `${activo.valoresFmt[c]} ${activo.tooltipSufijo}`;
      detalles[c] = {
        linea: `${cuerpo} · ${activo.periodo}`,
        aria: `${cuerpo}, ${activo.periodo}`,
      };
    }
    return { fills, detalles };
  }, [activo]);

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
      <div className="max-w-4xl lg:col-span-7">
        {mensaje}
        <IndicadorSelector activo={activoId} onActivar={setActivoId} />
      </div>

      <div className="lg:col-span-5">
        <HeroMapaMexico fills={fills} detalles={detalles} />
        <LeyendaQuintiles indicador={activo} />
      </div>
    </div>
  );
}
