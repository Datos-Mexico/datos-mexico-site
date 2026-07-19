/* Motor de las calculadoras de pensiones — portado TAL CUAL (D8) del engine
   las calculadoras originales (pensión + comparador). Funciones
   puras sin DOM. El bloque de constantes P y EX vive en sar_constantes.json
   (fuente única del lado TS; el motor Python se alinea en Fase 6-bis).

   NO reescribir la lógica ni "mejorar" ningún número: la paridad al centavo
   contra los golden cases P6 es la compuerta (lib/pensiones/calc parity). */

import constantes from "./sar_constantes.json";

type Bandas = { hasta: number; t: number[] }[];
type CSBandas = { hasta: number; v: number }[];

export type PConst = {
  UMA_D: number;
  SM_D: number;
  DIAS_MES: number;
  ANIO_BASE: number;
  TASAS: { conservador: number; base: number; optimista: number };
  CRECIMIENTO_SALARIAL: number;
  CUOTA_RETIRO: number;
  CUOTA_TRABAJADOR: number;
  CEAV_ANIOS: number[];
  CEAV_SM: number[];
  CEAV_BANDAS: Bandas;
  CS_SM: number;
  CS_BANDAS: CSBandas;
  DIVISOR: Record<"H" | "M", Record<number, number>>;
  LEY73_TABLA: number[][];
  LEY73_FACTOR_EDAD: Record<number, number>;
  LEY73_ASIGNACION: number;
  PMG_BANDAS_UMA: number[];
  PMG_MATRIZ: number[][][];
  PMG_FACTOR: number;
};

export const P = constantes.P as PConst;
export const EX = constantes.EX as Record<"H" | "M", Record<number, number>>;

export type Sexo = "H" | "M";

export type EntradaLey97 = {
  edad: number;
  sexo: Sexo;
  salario: number;
  saldo: number;
  semanas: number;
  edadRetiro: number;
  densidad: number;
  voluntaria: number;
  pre97?: boolean;
};

export type ResultadoLey97 = {
  saldoFinal: number;
  semanasFinales: number;
  reqSemanas: number;
  anioRetiro: number;
  elegible: boolean;
  pension: number;
  divisor: number;
};

export function semanasRequeridas(anio: number): number {
  // [R] L5 transitorio Cuarto
  if (anio >= 2031) return 1000;
  if (anio <= 2021) return 750;
  return 750 + 25 * (anio - 2021);
}

export function cuotaPatronalCEAV(sbcMensual: number, anio: number): number {
  const col = Math.min(Math.max(anio, 2023), 2030) - 2023;
  const sbcD = sbcMensual / P.DIAS_MES;
  if (sbcD <= P.SM_D * 1.0001) return P.CEAV_SM[col] / 100;
  const u = sbcD / P.UMA_D;
  for (const b of P.CEAV_BANDAS) if (u <= b.hasta) return b.t[col] / 100;
  return P.CEAV_BANDAS[P.CEAV_BANDAS.length - 1].t[col] / 100;
}

export function cuotaSocialDiaria(sbcMensual: number): number {
  const sbcD = sbcMensual / P.DIAS_MES;
  if (sbcD <= P.SM_D * 1.0001) return P.CS_SM;
  const u = sbcD / P.UMA_D;
  if (u > 4.0) return 0;
  for (const b of P.CS_BANDAS) if (u <= b.hasta) return b.v;
  return 0;
}

/* Proyeccion Ley 97 (anual, pesos reales). */
export function proyectaLey97(inp: EntradaLey97, tasaReal: number): ResultadoLey97 {
  const anios = inp.edadRetiro - inp.edad;
  let saldo = inp.saldo,
    sbc = Math.max(inp.salario, P.SM_D * P.DIAS_MES); // piso SBC = SM ([R] art.28)
  for (let t = 0; t < anios; t++) {
    const anio = P.ANIO_BASE + t;
    const tasaAporte = P.CUOTA_RETIRO + cuotaPatronalCEAV(sbc, anio) + P.CUOTA_TRABAJADOR;
    const aporte = (sbc * 12 * tasaAporte + cuotaSocialDiaria(sbc) * 365) * inp.densidad + inp.voluntaria * 12;
    saldo = (saldo + aporte) * (1 + tasaReal);
    sbc *= 1 + P.CRECIMIENTO_SALARIAL;
  }
  const anioRetiro = P.ANIO_BASE + anios;
  const semanas = inp.semanas + anios * 52 * inp.densidad;
  const req = semanasRequeridas(anioRetiro);
  const divisor = P.DIVISOR[inp.sexo][inp.edadRetiro];
  return {
    saldoFinal: saldo,
    semanasFinales: Math.floor(semanas),
    reqSemanas: req,
    anioRetiro,
    elegible: inp.edadRetiro >= 60 && semanas >= req,
    pension: saldo / divisor,
    divisor,
  };
}

export type ResultadoLey73 =
  | { elegible: false; semanas: number }
  | {
      elegible: true;
      semanas: number;
      pension: number;
      grupoVSMG: number;
      cuantia: number;
      incremento: number;
      nIncrementos: number;
      factorEdad: number;
    };

/* Ley 73 (transicion): pension mensual real a la edad de retiro. */
export function calculaLey73(inp: EntradaLey97): ResultadoLey73 {
  const anios = inp.edadRetiro - inp.edad;
  const semanas = Math.floor(inp.semanas + anios * 52 * inp.densidad);
  if (semanas < 500) return { elegible: false, semanas };
  const salD = Math.max(inp.salario, P.SM_D * P.DIAS_MES) / P.DIAS_MES;
  const vsmg = salD / P.SM_D; // [marca legal 6.3.1: unidad SM por texto literal; sujeta a opinion legal]
  let fila = P.LEY73_TABLA[P.LEY73_TABLA.length - 1];
  for (const f of P.LEY73_TABLA) if (vsmg <= f[0]) { fila = f; break; }
  const extra = semanas - 500;
  const nInc = Math.floor(extra / 52);
  const frac = extra - nInc * 52;
  const incrementos = nInc + (frac > 26 ? 1 : frac >= 13 ? 0.5 : 0); // [R] art.167 a)/b)
  const pctAnual = (fila[1] + incrementos * fila[2]) / 100;
  let anual = salD * 365 * pctAnual;
  const fEdad = P.LEY73_FACTOR_EDAD[Math.min(inp.edadRetiro, 65)];
  anual *= fEdad;
  anual *= 1 + P.LEY73_ASIGNACION;
  let mensual = anual / 12;
  const piso = P.SM_D * P.DIAS_MES; // [R] art.168: 100% SMG
  const techo = salD * P.DIAS_MES; // [R] art.169: 100% salario promedio
  mensual = Math.min(Math.max(mensual, piso), techo);
  return {
    elegible: true,
    semanas,
    pension: mensual,
    grupoVSMG: vsmg,
    cuantia: fila[1],
    incremento: fila[2],
    nIncrementos: incrementos,
    factorEdad: fEdad,
  };
}

export type ResultadoPMG =
  | { aplica: false }
  | {
      aplica: true;
      mensual: number;
      base2020: number;
      banda: number;
      filaEdad: number;
      colSemanas: number;
    };

/* Pension minima garantizada aplicable ([R] art.170 + transitorio Cuarto). */
export function pmgAplicable(
  edadRetiro: number,
  semanas: number,
  salarioMensual: number,
  anioRetiro: number,
): ResultadoPMG {
  const req = semanasRequeridas(anioRetiro);
  if (edadRetiro < 60 || semanas < req) return { aplica: false };
  const u = salarioMensual / P.DIAS_MES / P.UMA_D;
  let banda = P.PMG_BANDAS_UMA.length - 1;
  for (let i = 0; i < P.PMG_BANDAS_UMA.length; i++)
    if (u <= P.PMG_BANDAS_UMA[i]) { banda = i; break; }
  const fila = Math.min(Math.floor(edadRetiro), 65) - 60;
  const col = Math.min(Math.floor((semanas - req) / 25), 10);
  return {
    aplica: true,
    mensual: P.PMG_MATRIZ[banda][fila][col] * P.PMG_FACTOR,
    base2020: P.PMG_MATRIZ[banda][fila][col],
    banda,
    filaEdad: 60 + fila,
    colSemanas: req + col * 25,
  };
}

/* Comparador: una ruta = el motor de la ancla corrido a esa
   edad de retiro, mas esperanza condicionada [S6] y acumulado informativo. */
export type RutaComparador = ResultadoLey97 & {
  edadRetiro: number;
  ex: number;
  acumulado: number;
  l73pension: number | null;
};

export function comparaEdad(
  inp: EntradaLey97,
  edadRetiro: number,
  tasaReal: number,
): RutaComparador {
  const r = proyectaLey97({ ...inp, edadRetiro }, tasaReal);
  const ex = EX[inp.sexo][edadRetiro];
  const l73 = inp.pre97 ? calculaLey73({ ...inp, edadRetiro }) : null;
  return {
    ...r,
    edadRetiro,
    ex,
    acumulado: r.pension * 12 * ex,
    l73pension: l73 && l73.elegible ? l73.pension : null,
  };
}
