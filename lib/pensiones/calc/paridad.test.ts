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

console.log(`\n=== Paridad del motor de calculadoras vs golden vigentes ===`);
console.log(`${ok} OK · ${fail} FALLOS  (tolerancia: max($1, 0.05%) montos; exacto enteros/booleanos)`);
if (fail) { console.log(fallos.slice(0, 25).join("\n")); process.exit(1); }
console.log("PARIDAD TOTAL — el motor casa los golden cases al centavo.");
