/* Motores de las calculadoras de lógica propia (interés compuesto, reemplazo
   de ingreso, gasto de vida, gastos médicos) — portados TAL CUAL (D8). No
   dependen del bloque P de la proyección Ley 97: tienen sus propias
   constantes ([V] ENIGH/INPC/OIT-OCDE, [S6] EX EMSSA-09, [S1] escenarios).
   La paridad al centavo contra los golden vigentes es la compuerta. */

// ─────────────────────── interés compuesto ───────────────────────
export const IC_TASAS = { conservador: 0.015, base: 0.030, optimista: 0.045 }; // [S1]

export function acumula(aporteMensual: number, anios: number, tasaReal: number) {
  let saldo = 0;
  const tray: { t: number; saldo: number }[] = [{ t: 0, saldo: 0 }];
  for (let t = 1; t <= anios; t++) {
    saldo = (saldo + aporteMensual * 12) * (1 + tasaReal);
    tray.push({ t, saldo });
  }
  return { saldoFinal: saldo, tray };
}

export type EntradaIC = { edad: number; edadRetiro: number; aporte: number; espera: number };
export function comparaInicios(inp: EntradaIC, tasaReal: number) {
  const nHoy = inp.edadRetiro - inp.edad;
  const nTarde = Math.max(0, nHoy - inp.espera);
  const hoy = acumula(inp.aporte, nHoy, tasaReal);
  const tarde = acumula(inp.aporte, nTarde, tasaReal);
  return {
    nHoy, nTarde, hoy, tarde,
    aportadoHoy: inp.aporte * 12 * nHoy,
    aportadoTarde: inp.aporte * 12 * nTarde,
    costo: hoy.saldoFinal - tarde.saldoFinal,
  };
}

// ─────────────────────── reemplazo de ingreso ───────────────────────
export const REFS = { oitMinimo: 0.40, ocdePromedioNeta: 0.632, mexicoProyectadaNeta: 0.796 }; // [V]

export type EntradaReemplazo = {
  ingreso: number;
  desaparecen: Record<string, number>;
  aumentan: Record<string, number>;
};
export function calculaReemplazo(inp: EntradaReemplazo) {
  const suma = (obj: Record<string, number>) => Object.values(obj).reduce((a, b) => a + Math.max(0, b || 0), 0);
  const desaparecen = suma(inp.desaparecen);
  const aumentan = suma(inp.aumentan);
  const objetivo = Math.max(0, inp.ingreso - desaparecen + aumentan);
  return { desaparecen, aumentan, objetivo, tasa: inp.ingreso > 0 ? objetivo / inp.ingreso : null };
}

// ─────────────────────── gasto de vida ───────────────────────
const EX = {
  H: { 60: 24.47, 61: 23.74, 62: 23.02, 63: 22.31, 64: 21.61, 65: 20.91, 66: 20.23, 67: 19.55, 68: 18.88, 69: 18.22, 70: 17.56 },
  M: { 60: 28.18, 61: 27.26, 62: 26.34, 63: 25.42, 64: 24.50, 65: 23.59, 66: 22.68, 67: 21.78, 68: 20.88, 69: 19.99, 70: 19.10 },
} as const;

export const GV = {
  ENIGH_65MAS_TRIM: {
    alimentos: 15933.84, vestido: 1246.41, vivienda: 3409.15,
    limpieza: 3067.22, salud: 2285.01, transporte: 7114.20,
    educacion: 2338.37, personales: 3072.06, transferencias: 1169.97,
  } as Record<string, number>,
  ENIGH_TOTAL_TRIM: 39636.22,
  ENIGH_TAM_HOGAR: 2.827,
  INPC_FACTOR_2024_2026: 1.0655,
};
export const GV_RUBROS = Object.keys(GV.ENIGH_65MAS_TRIM);
export function referenciaMensualGasto(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const k in GV.ENIGH_65MAS_TRIM) out[k] = GV.ENIGH_65MAS_TRIM[k] / 3 * GV.INPC_FACTOR_2024_2026;
  return out;
}
export type EntradaGastoVida = { rubros: Record<string, number>; sexo: "H" | "M"; edadRetiro: number; ingreso: number };
export function calculaGastoVida(inp: EntradaGastoVida) {
  let mensual = 0;
  for (const k in inp.rubros) mensual += inp.rubros[k];
  const ref = referenciaMensualGasto();
  let refTotal = 0; for (const k in ref) refTotal += ref[k];
  const ex = EX[inp.sexo][inp.edadRetiro as 65];
  return {
    mensual, anual: mensual * 12,
    refTotal, vsRef: refTotal > 0 ? mensual / refTotal : 0,
    ex, acumulado: mensual * 12 * ex, acumuladoMas5: mensual * 12 * (ex + 5),
    cobertura: inp.ingreso > 0 ? inp.ingreso / mensual : null,
  };
}

// ─────────────────────── gastos médicos ───────────────────────
const GM = {
  INPC_FACTOR_2024_2026: 1.0655,
  ENIGH_SALUD_TRIM: { 30: 1286.18, 40: 1312.42, 50: 1611.07, 60: 1909.21, 70: 2315.10, 80: 2500.86 } as Record<number, number>,
};
export const DIF_MED = { igual: 0.0, historico: 0.002, alto: 0.015 };
export function bandaSalud(edad: number): number {
  return edad >= 80 ? 80 : edad >= 70 ? 70 : edad >= 60 ? 60 : edad >= 50 ? 50 : edad >= 40 ? 40 : 30;
}
export function referenciaSaludMensual(edad: number): number {
  return GM.ENIGH_SALUD_TRIM[bandaSalud(edad)] / 3 * GM.INPC_FACTOR_2024_2026;
}
export type EntradaGastosMedicos = { edad: number; sexo: "H" | "M"; edadRetiro: number; gastoHoy: number };
export function proyectaGastoMedico(inp: EntradaGastosMedicos, dif: number) {
  const nivel = inp.gastoHoy / referenciaSaludMensual(inp.edad);
  const ex = EX[inp.sexo][inp.edadRetiro as 65];
  const horizonte = Math.round(inp.edadRetiro + ex);
  const serie: { edad: number; mensual: number }[] = [];
  let acumulado = 0;
  for (let e = inp.edad; e <= horizonte; e++) {
    const mensual = referenciaSaludMensual(e) * nivel * Math.pow(1 + dif, e - inp.edad);
    serie.push({ edad: e, mensual });
    if (e >= inp.edadRetiro) acumulado += mensual * 12;
  }
  const aniosRetiro = horizonte - inp.edadRetiro + 1;
  return {
    serie, nivel, ex, horizonte, acumulado,
    alRetiro: serie.find((p) => p.edad === inp.edadRetiro)!.mensual,
    alFinal: serie[serie.length - 1].mensual,
    promedioRetiro: acumulado / (aniosRetiro * 12), aniosRetiro,
  };
}
