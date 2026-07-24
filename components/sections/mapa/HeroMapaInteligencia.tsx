"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ESTADOS, type ClaveEntidad } from "./estados-geometria";
import { INDICADORES, type IndicadorId } from "./indicadores-datos";
import { VISTAS } from "./vistas";
import { QUINTIL_FILLS } from "./rampa";
import { COPY } from "./indicadores-copy";
import { BloquePintado } from "./BloquePintado";
import { FraseExplicativa } from "./FraseExplicativa";
import { HeroMapaMexico, type FichaEntidad } from "./HeroMapaMexico";
import { VistaActiva } from "./VistaActiva";
import { LeyendaQuintiles } from "./LeyendaQuintiles";
import { MasDelCanon } from "./MasDelCanon";

/**
 * Contenedor de la capa de inteligencia del hero: el grid split (mensaje a
 * la izquierda con el selector de indicadores debajo; coropleta con leyenda
 * y cita a la derecha) y el único estado compartido — el indicador activo.
 *
 * El mensaje llega como children server-rendered: este componente no toca
 * su contenido. Cambiar de indicador es un render (los 32 fills nuevos
 * animan por CSS); el movimiento del cursor nunca re-renderiza (patrón del
 * mapa). Registro dual: tooltip y aria usan la capa humana (indicadores-
 * copy); la cita técnica de la leyenda queda intacta. En móvil no hay
 * selector: coropleta estática del default con su frase, leyenda y cita.
 */
const VISTA_ACTIVA = VISTAS.find((v) => v.activa) ?? VISTAS[0];

export function HeroMapaInteligencia({ mensaje }: { mensaje: ReactNode }) {
  // Lo pintado en el mapa: el rey de la vista activa por defecto; el hover
  // sobre satélites o sobre la fila "Más del canon" lo cambia y queda.
  const [pintadoId, setPintadoId] = useState<IndicadorId>(VISTA_ACTIVA.rey ?? INDICADORES[0].id);
  const activo = INDICADORES.find((i) => i.id === pintadoId) ?? INDICADORES[0];

  const { fills, fichas, frase } = useMemo(() => {
    const voz = COPY[activo.id];
    // Mini-ficha: lo pintado ocupa el slot del rey; la retícula lleva los
    // demás indicadores de la vista (si lo pintado es de la vista, los 4
    // restantes; si viene de Más del canon, los 4 satélites de la vista).
    const idsVista = VISTA_ACTIVA.rey
      ? [VISTA_ACTIVA.rey, ...(VISTA_ACTIVA.satelites ?? [])]
      : [];
    const enVista = idsVista.includes(activo.id);
    const idsReticula = enVista
      ? idsVista.filter((id) => id !== activo.id)
      : (VISTA_ACTIVA.satelites ?? []);
    const porId = new Map(INDICADORES.map((i) => [i.id, i]));
    const minusc = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);

    const fills: Partial<Record<ClaveEntidad, string>> = {};
    const fichas = {} as Record<ClaveEntidad, FichaEntidad>;
    for (const e of ESTADOS) {
      const c = e.clave;
      fills[c] = QUINTIL_FILLS[activo.quintil[c] - 1];
      const linea = voz.tooltip(activo.valores[c], activo.periodo);
      fichas[c] = {
        aria: linea.replace(" · ", ", "),
        rey: {
          valor: activo.valoresFmt[c],
          label: minusc(voz.nombreHumano),
          periodo: activo.periodo,
        },
        satelites: idsReticula.map((id) => {
          const ind = porId.get(id);
          return {
            valor: ind ? ind.valoresFmt[c] : "",
            label: COPY[id].fichaLabel,
          };
        }),
      };
    }
    return { fills, fichas, frase: voz.frase(activo.valorNacional, activo.periodo) };
  }, [activo]);

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
      <div className="max-w-4xl lg:col-span-7">
        {mensaje}
        <VistaActiva vista={VISTA_ACTIVA} pintado={pintadoId} onPintar={setPintadoId} />
      </div>

      <div className="lg:col-span-5">
        <HeroMapaMexico fills={fills} fichas={fichas} />
        <BloquePintado indicador={activo} />
        <FraseExplicativa texto={frase} />
        <LeyendaQuintiles indicador={activo} />
        <MasDelCanon pintado={pintadoId} onPintar={setPintadoId} />
      </div>
    </div>
  );
}
