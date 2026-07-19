/* Funciones de las calculadoras de la familia motor-compartido (ahorro,
   aportaciones, brecha, elegibilidad) — portadas TAL CUAL (D8). Reutilizan el
   motor núcleo de engine.ts; solo añaden la métrica propia de cada
   herramienta. La paridad al centavo contra los golden vigentes es la
   compuerta. No reescribir la lógica. */

import {
  P,
  proyectaLey97,
  calculaLey73,
  semanasRequeridas,
  type EntradaLey97,
  type ResultadoLey97,
  type ResultadoLey73,
  type Sexo,
} from "./engine";

// ─────────────────────────────── ahorro ───────────────────────────────
/* Capital meta: renta mensual meta × divisor EMSSA-09 @2.5% real [S7]. */
export function metaCapital(metaMensual: number, sexo: Sexo, edadRetiro: number): number {
  return metaMensual * P.DIVISOR[sexo][edadRetiro];
}
/* Valor futuro de $1/mes adicional, por diferencia del propio motor
   (linealidad en `voluntaria`). */
export function factorAportePorPeso(inp: EntradaLey97, tasaReal: number): number {
  const s1 = proyectaLey97({ ...inp, voluntaria: (inp.voluntaria || 0) + 1 }, tasaReal).saldoFinal;
  const s0 = proyectaLey97(inp, tasaReal).saldoFinal;
  return s1 - s0;
}
export type EntradaAhorro = EntradaLey97 & { meta: number };
export function aporteParaMeta(inp: EntradaAhorro, tasaReal: number) {
  const cap = metaCapital(inp.meta, inp.sexo, inp.edadRetiro);
  const s0 = proyectaLey97(inp, tasaReal).saldoFinal;
  if (s0 >= cap) return { aporte: 0, capitalMeta: cap, saldoActual: s0, cubierto: s0 / cap };
  const f = factorAportePorPeso(inp, tasaReal);
  return { aporte: (cap - s0) / f, capitalMeta: cap, saldoActual: s0, cubierto: s0 / cap };
}

// ───────────────────────────── aportaciones ─────────────────────────────
export type EntradaAportaciones = EntradaLey97 & { extra: number };
export function impactoAporte(inp: EntradaAportaciones, tasaReal: number) {
  const sin = proyectaLey97(inp, tasaReal).saldoFinal;
  const con = proyectaLey97({ ...inp, voluntaria: (inp.voluntaria || 0) + inp.extra }, tasaReal).saldoFinal;
  const saldoExtra = con - sin;
  const divisor = P.DIVISOR[inp.sexo][inp.edadRetiro];
  const aportado = inp.extra * 12 * (inp.edadRetiro - inp.edad);
  return { sin, con, saldoExtra, pensionExtra: saldoExtra / divisor, aportado, rendimiento: saldoExtra - aportado, divisor };
}

// ─────────────────────────────── brecha ───────────────────────────────
export type EntradaBrecha = EntradaLey97 & { gasto: number; otros: number };
export function calculaBrecha(inp: EntradaBrecha, tasaReal: number) {
  const r97 = proyectaLey97({ ...inp, voluntaria: 0 }, tasaReal);
  let pension = r97.pension, regimen = "Ley 97";
  let l73: ResultadoLey73 | null = null;
  if (inp.pre97) {
    l73 = calculaLey73(inp);
    if (l73.elegible && l73.pension > pension) { pension = l73.pension; regimen = "Ley 73"; }
  }
  const ingreso = pension + inp.otros;
  const brecha = inp.gasto - ingreso;
  const divisor = P.DIVISOR[inp.sexo][inp.edadRetiro];
  return {
    r97: r97 as ResultadoLey97, l73, regimen, pension, ingreso, brecha,
    cobertura: inp.gasto > 0 ? ingreso / inp.gasto : Infinity,
    capitalBrecha: brecha > 0 ? brecha * divisor : 0, divisor,
  };
}

// ───────────────────────────── elegibilidad ─────────────────────────────
const EL = { ANIO_BASE: 2026, EDAD_CESANTIA: 60, EDAD_VEJEZ: 65, SEMANAS_L73: 500 };
export type EntradaElegibilidad = {
  edad: number;
  semanas: number;
  pre97: boolean;
  edadRetiro: number;
  densidad: number;
};
export function evaluaElegibilidad(inp: EntradaElegibilidad) {
  const anios = inp.edadRetiro - inp.edad;
  const anioRetiro = EL.ANIO_BASE + anios;
  const req = semanasRequeridas(anioRetiro);
  const semanas = Math.floor(inp.semanas + anios * 52 * inp.densidad);
  const cumpleEdad = inp.edadRetiro >= EL.EDAD_CESANTIA;
  const tipo = inp.edadRetiro >= EL.EDAD_VEJEZ ? "vejez" : "cesantía en edad avanzada";
  const cumpleSemanas = semanas >= req;
  const tray: { edad: number; anio: number; semanas: number; req: number }[] = [];
  for (let t = 0; t <= Math.max(anios, 0); t++)
    tray.push({ edad: inp.edad + t, anio: EL.ANIO_BASE + t, semanas: Math.floor(inp.semanas + t * 52 * inp.densidad), req: semanasRequeridas(EL.ANIO_BASE + t) });
  let cruce: { edad: number; anio: number; semanas: number } | null = null;
  for (let t = 0; inp.edad + t <= 100; t++) {
    const e = inp.edad + t, a = EL.ANIO_BASE + t, s = inp.semanas + t * 52 * inp.densidad;
    if (e >= EL.EDAD_CESANTIA && s >= semanasRequeridas(a)) { cruce = { edad: e, anio: a, semanas: Math.floor(s) }; break; }
  }
  const l73 = { aplica: inp.pre97, semanas, cumple: inp.pre97 && cumpleEdad && semanas >= EL.SEMANAS_L73, faltan: Math.max(0, EL.SEMANAS_L73 - semanas) };
  return { anioRetiro, req, semanas, tipo, cumpleEdad, cumpleSemanas, elegible: cumpleEdad && cumpleSemanas, faltan: Math.max(0, req - semanas), cruce, tray, l73 };
}
