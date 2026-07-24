// Las vistas temáticas del canon (directiva de dirección, F4): cada vista
// tiene un dato rey y sus satélites; el área del selector muestra la vista
// activa y el mapa pinta al rey por defecto. Solo la primera vista está
// activa en esta ola; las demás se completan cuando su ola de datos llega
// (los nombres ya existen para los dots del pulso).
//
// El pulso (rotación automática de vistas) se enciende en la Ola 2; sus
// reglas ya registradas: se pausa con el cursor sobre mapa o vista, y
// prefers-reduced-motion lo apaga por completo.

import type { IndicadorId } from "./indicadores-datos";

export interface VistaCanon {
  id: string;
  nombre: string;
  activa: boolean;
  rey?: IndicadorId;
  satelites?: IndicadorId[];
}

export const VISTAS: readonly VistaCanon[] = [
  {
    id: "bolsillo",
    nombre: "El bolsillo",
    activa: true,
    rey: "pobreza-laboral",
    satelites: ["ingreso", "informalidad", "desempleo", "empleo-formal"],
  },
  { id: "seguridad", nombre: "La seguridad", activa: false },
  { id: "alcanza", nombre: "Alcanza para vivir", activa: false },
  { id: "salud", nombre: "Salud y vida", activa: false },
  { id: "casa", nombre: "Casa y escuela", activa: false },
  { id: "economia", nombre: "Economía y conexión", activa: false },
];

// Indicadores del canon vigente sin vista propia todavía: accesibles en la
// fila "Más del canon" (transición F3→F4); cada ola que estrena su vista se
// lleva los suyos, y la fila desaparece con la última.
export const MAS_DEL_CANON: readonly IndicadorId[] = [
  "homicidios",
  "percepcion",
  "poblacion",
  "escolaridad",
  "pib",
];
