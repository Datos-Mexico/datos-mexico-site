// Las vistas temáticas del canon (directiva de dirección, F4): cada vista
// tiene un dato rey y sus satélites; el área del selector muestra la vista
// activa y el mapa pinta al rey por defecto. Las vistas sin ola de datos
// todavía existen solo de nombre, para los dots del pulso.
//
// El ARREGLO va en el orden canónico definitivo de dirección (Ola 3):
// 1 El bolsillo · 2 Alcanza para vivir · 3 Salud y vida · 4 Casa y escuela
// · 5 La seguridad · 6 Economía y conexión. Cada ola inserta su vista en su
// posición; la rotación del pulso y la numeración de los dots heredan este
// orden solas. El orden es criterio editorial y nunca degrada un dato (ver
// corolario 6 de docs/principios-editoriales.md).
//
// El pulso (rotación automática de vistas, vivo desde la Ola 2): rota solo
// entre vistas activas y solo con puntero fino; se pausa con el cursor o el
// foco sobre la columna del mapa o el bloque de la vista; al reanudar, el
// reloj arranca de cero; prefers-reduced-motion lo apaga por completo. La
// rotación siempre entra pintando al rey de la vista entrante.

import type { IndicadorId } from "./indicadores-datos";

// Intervalo del pulso — doctrina fijada por dirección (Ola 2): el pulso
// respira con el texto; max(minMs, porPalabraMs × palabras + baseMs) sobre
// la frase del rey de la vista en pantalla es el ritmo canónico. "dinamico"
// es el default de producción; el query-param ?pulso=fijo|dinamico|<ms>
// queda como herramienta de diagnóstico.
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
    id: "alcanza",
    nombre: "Alcanza para vivir",
    activa: true,
    rey: "pobreza",
    satelites: ["pobreza-extrema", "falta-comida", "ingreso-hogar", "gini"],
  },
  {
    id: "salud",
    nombre: "Salud y vida",
    activa: true,
    rey: "esperanza-vida",
    satelites: ["mortalidad-infantil", "sin-salud", "embarazo-adolescente", "hijos-mujer"],
  },
  { id: "casa", nombre: "Casa y escuela", activa: false },
  {
    id: "seguridad",
    nombre: "La seguridad",
    activa: true,
    rey: "homicidios",
    satelites: ["percepcion", "robo-coches", "mujeres-asesinadas", "victimas-delito"],
  },
  { id: "economia", nombre: "Economía y conexión", activa: false },
];

// Indicadores del canon vigente sin vista propia todavía: accesibles en la
// fila "Más del canon" (transición F3→F4); cada ola que estrena su vista se
// lleva los suyos, y la fila desaparece con la última. La Ola 2 se llevó a
// homicidios y percepción a la vista de seguridad.
export const MAS_DEL_CANON: readonly IndicadorId[] = ["poblacion", "escolaridad", "pib"];
