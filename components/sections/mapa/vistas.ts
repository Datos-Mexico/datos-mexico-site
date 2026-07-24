// Las vistas temáticas del canon (directiva de dirección, F4): cada vista
// tiene un dato rey y sus satélites; el área del selector muestra la vista
// activa y el mapa pinta al rey por defecto. Las vistas sin ola de datos
// todavía existen solo de nombre, para los dots del pulso.
//
// El pulso (rotación automática de vistas, vivo desde la Ola 2): rota solo
// entre vistas activas y solo con puntero fino; se pausa con el cursor o el
// foco sobre la columna del mapa o el bloque de la vista; al reanudar, el
// reloj arranca de cero; prefers-reduced-motion lo apaga por completo. La
// rotación siempre entra pintando al rey de la vista entrante.

import type { IndicadorId } from "./indicadores-datos";

// Intervalo del pulso: parámetro de dirección. El modo dinámico da tiempo
// de lectura proporcional a la frase del rey de la vista en pantalla; el
// query-param ?pulso=fijo|dinamico permite compararlos en vivo antes de
// fijar la decisión.
export const PULSO = {
  modo: "dinamico" as "dinamico" | "fijo",
  fijoMs: 12_000,
  porPalabraMs: 350,
  baseMs: 3_000,
  minMs: 9_000,
};

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
  {
    id: "seguridad",
    nombre: "La seguridad",
    activa: true,
    rey: "homicidios",
    satelites: ["percepcion", "robo-coches", "mujeres-asesinadas", "victimas-delito"],
  },
  { id: "alcanza", nombre: "Alcanza para vivir", activa: false },
  { id: "salud", nombre: "Salud y vida", activa: false },
  { id: "casa", nombre: "Casa y escuela", activa: false },
  { id: "economia", nombre: "Economía y conexión", activa: false },
];

// Indicadores del canon vigente sin vista propia todavía: accesibles en la
// fila "Más del canon" (transición F3→F4); cada ola que estrena su vista se
// lleva los suyos, y la fila desaparece con la última. La Ola 2 se llevó a
// homicidios y percepción a la vista de seguridad.
export const MAS_DEL_CANON: readonly IndicadorId[] = ["poblacion", "escolaridad", "pib"];
