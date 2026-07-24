"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ESTADOS, type ClaveEntidad } from "./estados-geometria";
import { INDICADORES, type IndicadorId } from "./indicadores-datos";
import { PULSO, VISTAS } from "./vistas";
import { QUINTIL_FILLS } from "./rampa";
import { COPY } from "./indicadores-copy";
import { BloquePintado } from "./BloquePintado";
import { FraseExplicativa } from "./FraseExplicativa";
import { HeroMapaMexico, type FichaEntidad } from "./HeroMapaMexico";
import { VistaActiva } from "./VistaActiva";
import { LeyendaQuintiles } from "./LeyendaQuintiles";
import { MasDelCanon } from "./MasDelCanon";

/**
 * Contenedor de la capa de inteligencia del hero (F4, vistas + pulso): el
 * grid split — mensaje a la izquierda con la vista activa debajo; a la
 * derecha la coropleta con el bloque del pintado, su frase, leyenda, cita y
 * la fila Más del canon — y el estado compartido: la vista en pantalla y lo
 * pintado en el mapa.
 *
 * El pulso rota entre las vistas activas y siempre entra pintando al rey de
 * la vista entrante. Se pausa con el cursor o el foco dentro de cualquiera
 * de las dos zonas interactivas (el bloque de la vista y la columna completa
 * del mapa: ahí viven todos los hovers que repintan, incluida la fila Más
 * del canon — rotar debajo del cursor rompería lo pintado por el usuario);
 * al reanudar, el reloj arranca de cero para que la vista reciba una lectura
 * completa. prefers-reduced-motion apaga la rotación por completo, y sin
 * puntero fino (touch/móvil) no hay rotación: la pausa por hover no existe
 * ahí y un carrusel imparable no es una promesa que este módulo haga.
 *
 * Intervalo: parámetro PULSO (vistas.ts). El query-param ?pulso=fijo,
 * ?pulso=dinamico o ?pulso=<ms> permite comparar en vivo antes de fijar la
 * decisión de dirección.
 *
 * El mensaje llega como children server-rendered: este componente no toca su
 * contenido. Cambiar la vista o lo pintado es un render (los 32 fills animan
 * por CSS); el movimiento del cursor nunca re-renderiza. Registro dual: la
 * mini-ficha y el aria usan la capa humana; la cita técnica queda intacta.
 * La frase solo se anuncia (aria-live) en cambios iniciados por el usuario:
 * narrar cada rotación automática sería ruido permanente en lector de
 * pantalla. En móvil: coropleta estática del rey de la vista uno.
 */
const ACTIVAS = VISTAS.filter((v) => v.activa);

// Tiempo de lectura de una vista: proporcional a las palabras de la frase
// de su rey (modo dinámico) o fijo (decisión de dirección pendiente en vivo).
function intervaloMs(vistaIdx: number, override: string | null): number {
  if (override && /^\d+$/.test(override)) return Number(override);
  const modo = override === "fijo" || override === "dinamico" ? override : PULSO.modo;
  if (modo === "fijo") return PULSO.fijoMs;
  const vista = ACTIVAS[vistaIdx];
  const rey = INDICADORES.find((i) => i.id === vista.rey);
  if (!rey) return PULSO.fijoMs;
  const frase = COPY[rey.id].frase(rey.valorNacional, rey.periodo);
  const palabras = frase.split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t)).length;
  return Math.max(PULSO.minMs, PULSO.porPalabraMs * palabras + PULSO.baseMs);
}

export function HeroMapaInteligencia({ mensaje }: { mensaje: ReactNode }) {
  const [vistaIdx, setVistaIdx] = useState(0);
  const vista = ACTIVAS[vistaIdx];

  // Lo pintado en el mapa: el rey de la vista en pantalla por defecto; el
  // hover sobre satélites o sobre Más del canon lo cambia y queda. La
  // rotación lo reinicia al rey de la vista entrante.
  const [pintadoId, setPintadoId] = useState<IndicadorId>(vista.rey ?? INDICADORES[0].id);
  const activo = INDICADORES.find((i) => i.id === pintadoId) ?? INDICADORES[0];

  // Solo los cambios iniciados por el usuario se anuncian en aria-live.
  const [origen, setOrigen] = useState<"user" | "auto">("user");

  // Pausa por cursor o foco dentro de las dos zonas interactivas (contador:
  // el cursor puede estar en una zona mientras el foco vive en la otra).
  const [pausas, setPausas] = useState(0);

  const [reducida, setReducida] = useState(false); // prefers-reduced-motion
  const [punteroFino, setPunteroFino] = useState(false);
  const [pulsoParam, setPulsoParam] = useState<string | null>(null);

  useEffect(() => {
    const mqReducida = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqFino = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sincroniza = () => {
      setReducida(mqReducida.matches);
      setPunteroFino(mqFino.matches);
    };
    sincroniza();
    mqReducida.addEventListener("change", sincroniza);
    mqFino.addEventListener("change", sincroniza);
    setPulsoParam(new URLSearchParams(window.location.search).get("pulso"));
    return () => {
      mqReducida.removeEventListener("change", sincroniza);
      mqFino.removeEventListener("change", sincroniza);
    };
  }, []);

  // El reloj del pulso. Cualquier pausa desmonta el timeout; al reanudar (o
  // al cambiar de vista) se programa un intervalo completo desde cero.
  useEffect(() => {
    if (pausas > 0 || reducida || !punteroFino || ACTIVAS.length < 2) return;
    const t = setTimeout(() => {
      const siguiente = (vistaIdx + 1) % ACTIVAS.length;
      setVistaIdx(siguiente);
      setPintadoId(ACTIVAS[siguiente].rey ?? INDICADORES[0].id);
      setOrigen("auto");
    }, intervaloMs(vistaIdx, pulsoParam));
    return () => clearTimeout(t);
  }, [vistaIdx, pausas, reducida, punteroFino, pulsoParam]);

  const pausar = () => setPausas((n) => n + 1);
  const reanudar = () => setPausas((n) => Math.max(0, n - 1));

  const pintar = (id: IndicadorId) => {
    setPintadoId(id);
    setOrigen("user");
  };

  // Navegación directa por dot (solo vistas activas): salta, pinta al rey y
  // reinicia el reloj (el cambio de vistaIdx reprograma el timeout).
  const irAVista = (id: string) => {
    const idx = ACTIVAS.findIndex((v) => v.id === id);
    if (idx < 0 || idx === vistaIdx) return;
    setVistaIdx(idx);
    setPintadoId(ACTIVAS[idx].rey ?? INDICADORES[0].id);
    setOrigen("user");
  };

  const { fills, fichas, frase } = useMemo(() => {
    const voz = COPY[activo.id];
    // Mini-ficha: lo pintado ocupa el slot del rey; la retícula lleva los
    // demás indicadores de la vista (si lo pintado es de la vista, los 4
    // restantes; si viene de Más del canon, los 4 satélites de la vista).
    const idsVista = vista.rey ? [vista.rey, ...(vista.satelites ?? [])] : [];
    const enVista = idsVista.includes(activo.id);
    const idsReticula = enVista
      ? idsVista.filter((id) => id !== activo.id)
      : (vista.satelites ?? []);
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
  }, [activo, vista]);

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
      <div className="max-w-4xl lg:col-span-7">
        {mensaje}
        <div
          onPointerEnter={pausar}
          onPointerLeave={reanudar}
          onFocusCapture={pausar}
          onBlurCapture={reanudar}
        >
          <VistaActiva vista={vista} pintado={pintadoId} onPintar={pintar} onVista={irAVista} />
        </div>
      </div>

      <div
        className="lg:col-span-5"
        onPointerEnter={pausar}
        onPointerLeave={reanudar}
        onFocusCapture={pausar}
        onBlurCapture={reanudar}
      >
        <HeroMapaMexico fills={fills} fichas={fichas} />
        <BloquePintado indicador={activo} />
        <FraseExplicativa texto={frase} anuncia={origen === "user"} />
        <LeyendaQuintiles indicador={activo} />
        <MasDelCanon pintado={pintadoId} onPintar={pintar} />
      </div>
    </div>
  );
}
