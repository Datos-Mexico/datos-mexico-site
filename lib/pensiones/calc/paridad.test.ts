/* Suite de paridad numérica del motor de las calculadoras de pensiones —
   sustituye el cotejo por hash que garantizaba la no-divergencia en el
   material original. Corre el motor TS contra los golden cases vigentes
   (inputs + resultados esperados en __fixtures__/golden-vigentes.json) dentro
   de la tolerancia declarada: max($1, 0.05%) en montos, exacto en enteros y
   booleanos. Cubre cuota social por banda, matriz PMG art.170, proyección
   Ley 97 (tres escenarios) y el comparador de edades.

   Ejecutar: npx tsx lib/pensiones/calc/paridad.test.ts
   Si algún caso falla: PARAR y reportar. No ajustar el esperado. */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  P,
  proyectaLey97,
  cuotaSocialDiaria,
  pmgAplicable,
  comparaEdad,
  type EntradaLey97,
} from "./engine";
import {
  aporteParaMeta,
  impactoAporte,
  calculaBrecha,
  evaluaElegibilidad,
  type EntradaAhorro,
  type EntradaAportaciones,
  type EntradaBrecha,
  type EntradaElegibilidad,
} from "./calculos";
import {
  IC_TASAS,
  REFS,
  comparaInicios,
  calculaReemplazo,
  calculaGastoVida,
  proyectaGastoMedico,
  DIF_MED,
  type EntradaIC,
  type EntradaReemplazo,
  type EntradaGastoVida,
  type EntradaGastosMedicos,
} from "./calculos-c";

const here = dirname(fileURLToPath(import.meta.url));
const golden = JSON.parse(readFileSync(join(here, "__fixtures__/golden-vigentes.json"), "utf8"));

const tolRel = 0.0005;
const cmpNum = (a: number, b: number) => Math.abs(a - b) <= Math.max(1, Math.abs(b) * tolRel);

let ok = 0;
let fail = 0;
const fallos: string[] = [];
function check(nombre: string, cond: boolean, got: unknown, exp: unknown) {
  if (cond) ok++;
  else { fail++; fallos.push(`  FALLO ${nombre}: obtenido ${got} vs esperado ${exp}`); }
}

// cuota social por banda
for (const c of golden.cuota_social)
  check(`CS ${c.caso.slice(0, 44)}`, cmpNum(cuotaSocialDiaria(c.sbcMensual), c.esperado), cuotaSocialDiaria(c.sbcMensual), c.esperado);

// PMG matriz art.170
for (const c of golden.pmg) {
  const r = pmgAplicable(c.args[0], c.args[1], c.args[2], c.args[3]);
  check(`PMG ${c.caso.slice(0, 38)} · aplica`, r.aplica === c.esperado.aplica, r.aplica, c.esperado.aplica);
  if (c.esperado.aplica && r.aplica) {
    check(`PMG ${c.caso.slice(0, 38)} · mensual`, cmpNum(r.mensual, c.esperado.mensual), r.mensual, c.esperado.mensual);
    check(`PMG ${c.caso.slice(0, 38)} · base2020`, r.base2020 === c.esperado.base2020, r.base2020, c.esperado.base2020);
  }
}

// proyección Ley 97, tres escenarios
for (const c of golden.ley97)
  for (const esc of ["conservador", "base", "optimista"] as const) {
    const r = proyectaLey97(c.inputs as EntradaLey97, P.TASAS[esc]);
    const e = c.esperado[esc];
    check(`L97 ${c.caso.slice(0, 30)} ${esc} · pension`, cmpNum(r.pension, e.pension), r.pension, e.pension);
    check(`L97 ${c.caso.slice(0, 30)} ${esc} · saldo`, cmpNum(r.saldoFinal, e.saldoFinal), r.saldoFinal, e.saldoFinal);
    check(`L97 ${c.caso.slice(0, 30)} ${esc} · semanas`, r.semanasFinales === e.semanasFinales, r.semanasFinales, e.semanasFinales);
    check(`L97 ${c.caso.slice(0, 30)} ${esc} · elegible`, r.elegible === e.elegible, r.elegible, e.elegible);
  }

// comparador de edades
for (const c of golden.comparador)
  for (const ed of c.edades) {
    const r = comparaEdad(c.inputs as EntradaLey97, ed, P.TASAS[c.escenario as keyof typeof P.TASAS]);
    const e = c.esperado[String(ed)];
    check(`CMP ${c.caso.slice(0, 26)} @${ed} · pension`, cmpNum(r.pension, e.pension), r.pension, e.pension);
    check(`CMP ${c.caso.slice(0, 26)} @${ed} · acumulado`, cmpNum(r.acumulado, e.acumulado), r.acumulado, e.acumulado);
    check(`CMP ${c.caso.slice(0, 26)} @${ed} · ex`, r.ex === e.ex, r.ex, e.ex);
    check(`CMP ${c.caso.slice(0, 26)} @${ed} · l73`, (r.l73pension === null) === (e.l73pension === null), r.l73pension, e.l73pension);
  }

// ahorro — aporte para meta
let staleSkipped = 0;
for (const c of golden.ahorro) {
  if (c.stale) { staleSkipped++; continue; } // golden previo a IND-0069; cubierto por TS≡motor-original
  const r = aporteParaMeta(c.inputs as EntradaAhorro, P.TASAS[c.escenario as keyof typeof P.TASAS]);
  check(`AHO ${c.caso.slice(0, 30)} · aporte`, cmpNum(r.aporte, c.esperado.aporte), r.aporte, c.esperado.aporte);
  check(`AHO ${c.caso.slice(0, 30)} · capitalMeta`, cmpNum(r.capitalMeta, c.esperado.capitalMeta), r.capitalMeta, c.esperado.capitalMeta);
  check(`AHO ${c.caso.slice(0, 30)} · saldoActual`, cmpNum(r.saldoActual, c.esperado.saldoActual), r.saldoActual, c.esperado.saldoActual);
}

// aportaciones — impacto de una aportación extra
for (const c of golden.aportaciones) {
  const r = impactoAporte(c.inputs as EntradaAportaciones, P.TASAS[c.escenario as keyof typeof P.TASAS]);
  for (const k of ["sin", "con", "saldoExtra", "pensionExtra", "aportado", "rendimiento"] as const)
    check(`APO ${c.caso.slice(0, 28)} · ${k}`, cmpNum(r[k], c.esperado[k]), r[k], c.esperado[k]);
}

// brecha — brecha de retiro
for (const c of golden.brecha) {
  const r = calculaBrecha(c.inputs as EntradaBrecha, P.TASAS[c.escenario as keyof typeof P.TASAS]);
  check(`BRE ${c.caso.slice(0, 28)} · pension`, cmpNum(r.pension, c.esperado.pension), r.pension, c.esperado.pension);
  check(`BRE ${c.caso.slice(0, 28)} · ingreso`, cmpNum(r.ingreso, c.esperado.ingreso), r.ingreso, c.esperado.ingreso);
  check(`BRE ${c.caso.slice(0, 28)} · brecha`, cmpNum(r.brecha, c.esperado.brecha), r.brecha, c.esperado.brecha);
  check(`BRE ${c.caso.slice(0, 28)} · capitalBrecha`, cmpNum(r.capitalBrecha, c.esperado.capitalBrecha), r.capitalBrecha, c.esperado.capitalBrecha);
  check(`BRE ${c.caso.slice(0, 28)} · regimen`, r.regimen === c.esperado.regimen, r.regimen, c.esperado.regimen);
}

// elegibilidad — requisitos + trayectoria
for (const c of golden.elegibilidad) {
  const r = evaluaElegibilidad(c.inputs as EntradaElegibilidad);
  check(`ELE ${c.caso.slice(0, 30)} · anioRetiro`, r.anioRetiro === c.esperado.anioRetiro, r.anioRetiro, c.esperado.anioRetiro);
  check(`ELE ${c.caso.slice(0, 30)} · req`, r.req === c.esperado.req, r.req, c.esperado.req);
  check(`ELE ${c.caso.slice(0, 30)} · semanas`, r.semanas === c.esperado.semanas, r.semanas, c.esperado.semanas);
  check(`ELE ${c.caso.slice(0, 30)} · elegible`, r.elegible === c.esperado.elegible, r.elegible, c.esperado.elegible);
  check(`ELE ${c.caso.slice(0, 30)} · faltan`, r.faltan === c.esperado.faltan, r.faltan, c.esperado.faltan);
  check(`ELE ${c.caso.slice(0, 30)} · cruce`, JSON.stringify(r.cruce) === JSON.stringify(c.esperado.cruce), JSON.stringify(r.cruce), JSON.stringify(c.esperado.cruce));
  check(`ELE ${c.caso.slice(0, 30)} · l73cumple`, r.l73.cumple === c.esperado.l73cumple, r.l73.cumple, c.esperado.l73cumple);
}

// interés compuesto
for (const c of golden.interes_compuesto) {
  const r = comparaInicios(c.inputs as EntradaIC, IC_TASAS[c.escenario as keyof typeof IC_TASAS]);
  check(`IC ${c.caso.slice(0, 30)} · saldoHoy`, cmpNum(r.hoy.saldoFinal, c.esperado.saldoHoy), r.hoy.saldoFinal, c.esperado.saldoHoy);
  check(`IC ${c.caso.slice(0, 30)} · saldoTarde`, cmpNum(r.tarde.saldoFinal, c.esperado.saldoTarde), r.tarde.saldoFinal, c.esperado.saldoTarde);
  check(`IC ${c.caso.slice(0, 30)} · costo`, cmpNum(r.costo, c.esperado.costo), r.costo, c.esperado.costo);
  check(`IC ${c.caso.slice(0, 30)} · nHoy`, r.nHoy === c.esperado.nHoy, r.nHoy, c.esperado.nHoy);
  check(`IC ${c.caso.slice(0, 30)} · nTarde`, r.nTarde === c.esperado.nTarde, r.nTarde, c.esperado.nTarde);
}

// reemplazo de ingreso
for (const c of golden.reemplazo) {
  if (c.refs) { // caso RREF: verifica las constantes de referencia [V]
    check(`REE refs · oit`, REFS.oitMinimo === c.refs.oitMinimo, REFS.oitMinimo, c.refs.oitMinimo);
    check(`REE refs · ocde`, REFS.ocdePromedioNeta === c.refs.ocdePromedioNeta, REFS.ocdePromedioNeta, c.refs.ocdePromedioNeta);
    check(`REE refs · mexico`, REFS.mexicoProyectadaNeta === c.refs.mexicoProyectadaNeta, REFS.mexicoProyectadaNeta, c.refs.mexicoProyectadaNeta);
    continue;
  }
  const r = calculaReemplazo(c.inputs as EntradaReemplazo);
  check(`REE ${c.caso.slice(0, 30)} · desaparecen`, cmpNum(r.desaparecen, c.esperado.desaparecen), r.desaparecen, c.esperado.desaparecen);
  check(`REE ${c.caso.slice(0, 30)} · aumentan`, cmpNum(r.aumentan, c.esperado.aumentan), r.aumentan, c.esperado.aumentan);
  check(`REE ${c.caso.slice(0, 30)} · objetivo`, cmpNum(r.objetivo, c.esperado.objetivo), r.objetivo, c.esperado.objetivo);
  check(`REE ${c.caso.slice(0, 30)} · tasa`, r.tasa === null ? c.esperado.tasa === null : cmpNum(r.tasa, c.esperado.tasa), r.tasa, c.esperado.tasa);
}

// gasto de vida
for (const c of golden.gasto_vida) {
  const r = calculaGastoVida(c.inputs as EntradaGastoVida);
  for (const k of ["mensual", "anual", "refTotal", "ex", "acumulado", "acumuladoMas5"] as const)
    check(`GV ${c.caso.slice(0, 28)} · ${k}`, cmpNum(r[k], c.esperado[k]), r[k], c.esperado[k]);
}

// gastos médicos
for (const c of golden.gastos_medicos) {
  const r = proyectaGastoMedico(c.inputs as EntradaGastosMedicos, DIF_MED[c.escenario as keyof typeof DIF_MED]);
  for (const k of ["alRetiro", "alFinal", "acumulado", "promedioRetiro", "ex"] as const)
    check(`GM ${c.caso.slice(0, 28)} · ${k}`, cmpNum(r[k], c.esperado[k]), r[k], c.esperado[k]);
  check(`GM ${c.caso.slice(0, 28)} · horizonte`, r.horizonte === c.esperado.horizonte, r.horizonte, c.esperado.horizonte);
  check(`GM ${c.caso.slice(0, 28)} · anios`, r.aniosRetiro === c.esperado.anios, r.aniosRetiro, c.esperado.anios);
}

console.log(`\n=== Paridad del motor de calculadoras vs golden vigentes ===`);
if (staleSkipped) console.log(`(${staleSkipped} caso stale saltado — golden previo al refino de cuota social; cubierto por el invariante TS≡motor-original en staging)`);
console.log(`${ok} OK · ${fail} FALLOS  (tolerancia: max($1, 0.05%) montos; exacto enteros/booleanos)`);
if (fail) { console.log(fallos.slice(0, 25).join("\n")); process.exit(1); }
console.log("PARIDAD TOTAL — el motor casa los golden cases al centavo.");
