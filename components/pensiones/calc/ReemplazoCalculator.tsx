"use client";

/* Calculadora de reemplazo de ingreso — cuerpo portado TAL CUAL (D8):
   presupuesto editable (partidas que desaparecen/aumentan), cascada
   ingreso→objetivo, escala SVG de referencias OIT/OCDE, rAF. Aritmética de
   presupuesto pura. Motor en lib/pensiones/calc/calculos-c. */

import { useEffect, useRef } from "react";
import { REFS, calculaReemplazo, type EntradaReemplazo } from "@/lib/pensiones/calc/calculos-c";
import "./reemplazo.css";

export function ReemplazoCalculator() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const $ = (id: string) => root.querySelector<HTMLElement>("#" + id)!;
    const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fmt = (n: number) => "$" + Math.round(n).toLocaleString("es-MX");

    function leeInputs(): EntradaReemplazo {
      const v = (id: string) => +($(id) as HTMLInputElement).value;
      return {
        ingreso: v("ingreso"),
        desaparecen: { trabajo: v("d1"), vivienda: v("d2"), dependientes: v("d3"), ahorro: v("d4"), otros: v("d5") },
        aumentan: { salud: v("a1"), esparcimiento: v("a2"), otros: v("a3") },
      };
    }
    let animState: number | null = null;
    function tween(from: number, to: number, ms: number, onStep: (k: number, to: number) => void) {
      if (REDUCED || ms <= 0) { onStep(1, to); return; }
      if (animState) cancelAnimationFrame(animState);
      const t0 = performance.now();
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);
      function step(now: number) { const t = Math.min(1, (now - t0) / ms), k = ease(t); onStep(k, to); if (t < 1) animState = requestAnimationFrame(step); }
      animState = requestAnimationFrame(step);
    }
    const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

    function drawEscala(tasa: number | null) {
      const svg = $("escala");
      const W = 660, l = 30, r = 30, y = 74;
      const maxPct = Math.max(110, tasa !== null ? tasa * 100 + 12 : 110);
      const X = (pct: number) => l + (W - l - r) * (pct / maxPct);
      let ticks = "";
      for (let p = 0; p <= maxPct - 5; p += 20) {
        ticks += `<line x1="${X(p)}" y1="${y - 4}" x2="${X(p)}" y2="${y + 4}" stroke="var(--line)" stroke-width="1.5"/>`
          + `<text class="axis-lbl" x="${X(p)}" y="${y + 18}" text-anchor="middle">${p}%</text>`;
      }
      const refs = [
        { pct: 40, lbl: "OIT · mínimo 40%", dy: -34 },
        { pct: 63.2, lbl: "OCDE · promedio 63%", dy: -50 },
        { pct: 79.6, lbl: "México proy. 80%*", dy: -34 },
      ];
      const refMarks = refs.map((rf) =>
        `<line x1="${X(rf.pct)}" y1="${y + (rf.dy < -40 ? -44 : -28)}" x2="${X(rf.pct)}" y2="${y}" stroke="var(--text-secondary)" stroke-width="1.4" stroke-dasharray="3 3"/>`
        + `<text class="ref-lbl" x="${X(rf.pct)}" y="${y + rf.dy}" text-anchor="middle">${rf.lbl}</text>`).join("");
      let tuMark = "";
      if (tasa !== null) {
        const p = tasa * 100;
        tuMark = `<circle cx="${X(p)}" cy="${y}" r="8" fill="var(--gold)" stroke="#fff" stroke-width="2.5"/>`
          + `<text class="tu-lbl" x="${X(p)}" y="${y + 36}" text-anchor="middle">tu presupuesto: ${p.toFixed(0)}%</text>`;
      }
      svg.innerHTML = `<line x1="${l}" y1="${y}" x2="${W - r}" y2="${y}" stroke="var(--navy)" stroke-width="2.5" stroke-linecap="round"/>` + ticks + refMarks + tuMark;
    }
    let prevBig = 0;
    function render() {
      const inp = leeInputs();
      const r = calculaReemplazo(inp);
      $("totDes").textContent = "− " + fmt(r.desaparecen);
      $("totAum").textContent = "+ " + fmt(r.aumentan);
      const target = r.objetivo;
      tween(prevBig, target, 420, (k) => { $("bigObjetivo").innerHTML = fmt(lerp(prevBig, target, k)) + "<small> /mes</small>"; });
      prevBig = target;
      $("tasaLbl").innerHTML = r.tasa === null
        ? "Escribe tu ingreso actual para calcular el porcentaje"
        : `Es el <strong style="color:#fff">${(100 * r.tasa).toFixed(0)}%</strong> de tu ingreso actual — tu tasa de reemplazo implicada`;
      $("heroSide").innerHTML =
        `<div class="row"><span>Tu ingreso hoy</span><b>${fmt(inp.ingreso)}</b></div>`
        + `<div class="row"><span>Desaparece al retirarte</span><b>− ${fmt(r.desaparecen)}</b></div>`
        + `<div class="row"><span>Aumenta al retirarte</span><b>+ ${fmt(r.aumentan)}</b></div>`
        + `<div class="row" style="border:none"><span>Tu ingreso objetivo</span><b>${fmt(r.objetivo)}</b></div>`;
      const maxV = Math.max(inp.ingreso, r.objetivo, 1);
      const pct = (v: number) => (100 * v / maxV).toFixed(1);
      $("casc").innerHTML =
        `<div class="casc-row"><div class="c-lbl">Tu ingreso hoy</div>
          <div class="casc-track"><div class="casc-fill" style="left:0;width:${pct(inp.ingreso)}%;background:var(--navy)"></div></div>
          <div class="casc-val">${fmt(inp.ingreso)}</div></div>`
        + `<div class="casc-row"><div class="c-lbl">Desaparece<span class="hint">trabajo, pagos que terminan…</span></div>
          <div class="casc-track"><div class="casc-fill" style="left:${pct(Math.max(0, inp.ingreso - r.desaparecen))}%;width:${pct(Math.min(r.desaparecen, inp.ingreso))}%;background:rgba(30,110,69,.45)"></div></div>
          <div class="casc-val">− ${fmt(r.desaparecen)}</div></div>`
        + `<div class="casc-row"><div class="c-lbl">Aumenta<span class="hint">salud, tiempo libre…</span></div>
          <div class="casc-track"><div class="casc-fill" style="left:${pct(Math.max(0, inp.ingreso - r.desaparecen))}%;width:${pct(r.aumentan)}%;background:rgba(138,90,0,.5)"></div></div>
          <div class="casc-val">+ ${fmt(r.aumentan)}</div></div>`
        + `<div class="casc-row"><div class="c-lbl"><b>Tu ingreso objetivo</b></div>
          <div class="casc-track"><div class="casc-fill" style="left:0;width:${pct(r.objetivo)}%;background:var(--gold)"></div></div>
          <div class="casc-val">${fmt(r.objetivo)}</div></div>`;
      $("ref40").textContent = fmt(inp.ingreso * REFS.oitMinimo) + " /mes";
      $("ref63").textContent = fmt(inp.ingreso * REFS.ocdePromedioNeta) + " /mes";
      $("ref80").textContent = fmt(inp.ingreso * REFS.mexicoProyectadaNeta) + " /mes";
      drawEscala(r.tasa);
      let nota = "";
      if (r.tasa !== null && r.tasa > 1.05) nota = `Tu presupuesto pide <strong>más que tu ingreso actual</strong> (${(100 * r.tasa).toFixed(0)}%). No es un error: pasa cuando lo que aumenta (salud, por ejemplo) pesa más que lo que desaparece. Es información valiosa — significa que tu plan necesita más que "mantener el nivel".`;
      else if (r.tasa !== null && r.tasa < 0.35 && inp.ingreso > 0) nota = `Tu presupuesto quedó por debajo del mínimo de referencia de la OIT (40%). Revisa que las partidas que marcaste como "desaparecen" de verdad desaparezcan — subestimar el retiro es el error más caro.`;
      $("notaGasto").innerHTML = nota;
      $("notaGasto").style.display = nota ? "" : "none";
      const cmpTxt = r.tasa === null ? "" :
        (r.tasa >= REFS.mexicoProyectadaNeta ? "queda por arriba de la proyección OCDE para México (80%)" :
          r.tasa >= REFS.ocdePromedioNeta ? "queda entre el promedio OCDE (63%) y la proyección para México (80%)" :
            r.tasa >= REFS.oitMinimo ? "queda entre el mínimo OIT (40%) y el promedio OCDE (63%)" :
              "queda por debajo del mínimo de referencia de la OIT (40%)");
      $("interp").textContent = r.tasa === null
        ? "Escribe tu ingreso actual para que el presupuesto tome forma."
        : `Según tus partidas, tu retiro pediría ${fmt(r.objetivo)} al mes en pesos de hoy — el ${(100 * r.tasa).toFixed(0)}% de tu ingreso actual, que ${cmpTxt}. Ese porcentaje no es una meta que el observatorio te sugiera: es la consecuencia aritmética de lo que tú marcaste que desaparece y aumenta. Muévele a las partidas y míralo cambiar; y cuando tengas tu número, la pregunta siguiente es si tu trayectoria lo sostiene — esa es la calculadora de brecha.`;
    }
    const handlers: Array<[Element, () => void]> = [];
    root.querySelectorAll<HTMLElement>("#f input").forEach((el) => {
      const h = () => render();
      el.addEventListener("input", h); handlers.push([el, h]);
    });
    const onResize = () => render();
    addEventListener("resize", onResize);
    render();
    return () => { handlers.forEach(([el, h]) => el.removeEventListener("input", h)); removeEventListener("resize", onResize); if (animState) cancelAnimationFrame(animState); };
  }, []);

  return (
    <div className="calc-root" ref={rootRef}>
      <link rel="stylesheet" href="/pensiones/sar-29/vendor/fonts.css" precedence="default" />
      <div className="wrap">
        <header className="top">
          <div>
            <div className="kicker">Datos México · Calculadoras</div>
            <h1>¿Qué parte de tu ingreso actual necesitaría tu retiro?</h1>
            <p className="sub">Las reglas generales dicen "70%" sin conocerte. Aquí lo armas al revés: partes de tu ingreso, quitas lo que <strong>desaparece</strong> al retirarte y sumas lo que <strong>aumenta</strong> — y el porcentaje sale de <strong>tu</strong> presupuesto, no de una regla. Con referencias documentadas (OIT, OCDE) como contexto, nunca como meta.</p>
          </div>
          <div className="hero-meta">Vigencia de supuestos: <b>2026</b><br />Base: documento actuarial v1.0 · referencias OIT/OCDE versionadas<br />Aritmética de presupuesto, sin proyección</div>
        </header>
        <div className="calc-grid">
          <aside className="panel" id="f">
            <span className="step">Paso 1 · Tu presupuesto, no una regla</span>
            <h2>Tus datos</h2>
            <div className="field"><label htmlFor="ingreso">Ingreso mensual actual <span className="hint">neto, lo que llega a tu bolsillo</span></label>
              <input type="number" id="ingreso" min={0} step={500} defaultValue={20000} /></div>
            <div className="grupo des">
              <div className="g-head"><span className="g-title">Desaparece al retirarte</span><span className="g-total" id="totDes">$0</span></div>
              <div className="partida"><label htmlFor="d1"><b>Transporte y comidas de trabajo</b></label><input type="number" id="d1" min={0} step={100} defaultValue={1500} /></div>
              <div className="partida"><label htmlFor="d2"><b>Vivienda que terminas de pagar</b> <span className="hint">hipoteca/renta que ya no estará</span></label><input type="number" id="d2" min={0} step={100} defaultValue={0} /></div>
              <div className="partida"><label htmlFor="d3"><b>Hijos y dependientes</b> <span className="hint">si ya no dependerán de ti</span></label><input type="number" id="d3" min={0} step={100} defaultValue={0} /></div>
              <div className="partida"><label htmlFor="d4"><b>Tu ahorro para el retiro</b> <span className="hint">en el retiro ya no se ahorra para él</span></label><input type="number" id="d4" min={0} step={100} defaultValue={1000} /></div>
              <div className="partida"><label htmlFor="d5"><b>Otros que desaparecen</b></label><input type="number" id="d5" min={0} step={100} defaultValue={0} /></div>
            </div>
            <div className="grupo aum">
              <div className="g-head"><span className="g-title">Aumenta al retirarte</span><span className="g-total" id="totAum">$0</span></div>
              <div className="partida"><label htmlFor="a1"><b>Salud</b> <span className="hint">el gasto que sube con la edad — <a href="/pensiones/calculadoras/gastos-medicos" style={{ color: "inherit" }}>dimensiónalo aquí</a></span></label><input type="number" id="a1" min={0} step={100} defaultValue={1000} /></div>
              <div className="partida"><label htmlFor="a2"><b>Esparcimiento y tiempo libre</b> <span className="hint">más horas tuyas por llenar</span></label><input type="number" id="a2" min={0} step={100} defaultValue={500} /></div>
              <div className="partida"><label htmlFor="a3"><b>Otros que aumentan</b></label><input type="number" id="a3" min={0} step={100} defaultValue={0} /></div>
            </div>
          </aside>
          <section className="results">
            <div className="card hero-res">
              <div>
                <span className="step">Paso 2 · Tu número, no el de la regla</span>
                <div className="lbl">Ingreso mensual que tu presupuesto pide en retiro — en pesos de hoy</div>
                <div className="big" id="bigObjetivo">$0<small> /mes</small></div>
                <div className="lbl" id="tasaLbl" style={{ marginTop: "6px" }}></div>
              </div>
              <div className="hero-side" id="heroSide"></div>
            </div>
            <div className="card">
              <span className="step">De tu ingreso de hoy a tu objetivo</span>
              <h3>La cuenta, paso por paso</h3>
              <div className="casc" id="casc"></div>
            </div>
            <div className="card">
              <span className="step">Tu tasa frente a las referencias documentadas <span className="tag tV">V</span></span>
              <h3>Dónde queda tu porcentaje — y qué dice cada vara</h3>
              <div className="escala-wrap">
                <svg id="escala" viewBox="0 0 660 120" role="img" aria-label="Tu tasa de reemplazo comparada con las referencias OIT y OCDE"></svg>
              </div>
              <div className="scroll" style={{ marginTop: "10px" }}><table>
                <thead><tr><th>Referencia</th><th>Qué es</th><th>Con tu ingreso</th></tr></thead>
                <tbody>
                  <tr><td><b>40%</b></td><td>Mínimo del Convenio 102 de la OIT (cuadro anexo, parte XI; beneficiario tipo con ~30 años cotizados). México lo ratificó en 1961 incluyendo la parte de vejez.</td><td id="ref40">—</td></tr>
                  <tr><td><b>63%</b></td><td>Promedio OCDE de tasa de reemplazo <em>neta</em> al salario promedio, esquemas obligatorios (Pensions at a Glance 2025, tabla 4.4).</td><td id="ref63">—</td></tr>
                  <tr><td><b>80%</b></td><td>Proyección OCDE para México post-reformas (misma tabla: 79.6%). Ojo: incluye el complemento del Fondo de Pensiones para el Bienestar (2024), <em>fuera del perímetro</em> de estas calculadoras.</td><td id="ref80">—</td></tr>
                </tbody>
              </table></div>
              <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", margin: "8px 0 0" }}>Estas referencias tienen fuente citada y <strong>no son metas del observatorio ni recomendaciones</strong>: describen convenios y promedios, no tu vida. Tu porcentaje sale de tu presupuesto.</p>
            </div>
            <div className="note" id="notaGasto"></div>
            <div className="card">
              <span className="step">Paso 3 · Qué significa</span>
              <h3>Lectura de tu resultado</h3>
              <p className="interp" id="interp"></p>
            </div>
            <div className="card">
              <span className="step">Paso 4 · Siguiente paso</span>
              <h3>Para seguir entendiendo</h3>
              <div className="next">
                <a href="/pensiones/calculadoras/brecha">¿Tu trayectoria sostiene ese ingreso? (calculadora de brecha)</a>
                <a href="/pensiones/calculadoras/gasto-vida">El mismo número, armado desde el gasto (gasto de vida)</a>
                <a href="#supuestos">Metodología y supuestos</a>
              </div>
            </div>
          </section>
        </div>
        <div className="lower">
          <h2 id="supuestos" style={{ fontFamily: "Merriweather,Georgia,serif", color: "var(--navy)", fontSize: "19px", margin: "0 0 4px" }}>Metodología y supuestos <span className="hint">— vigencia: 2026 · documento base actuarial v1.0</span></h2>
          <details><summary><span className="tag tV">V</span> Referencias documentadas usadas</summary><div className="det-body">
            <ul>
              <li><strong>40%</strong> — mínimo del Convenio 102 de la OIT (1952), cuadro anexo a la Parte XI, para el beneficiario tipo con ~30 años de cotización; México lo ratificó el 12-oct-1961 aceptando la parte de vejez.</li>
              <li><strong>63.2% / 79.6%</strong> — tasas de reemplazo <em>netas</em>: promedio OCDE y proyección para México post-reformas (OECD, <em>Pensions at a Glance 2025</em>, tabla 4.4). La cifra de México incluye el complemento del Fondo de Pensiones para el Bienestar (2024), fuera del perímetro de estas calculadoras — se muestra con esa advertencia.</li>
              <li>No existe documento de CONSAR que consagre el "70%" clásico como meta oficial: por eso aquí no hay meta — hay tu presupuesto.</li>
            </ul></div></details>
          <details><summary><span className="tag tS">S</span> Supuestos y método declarados</summary><div className="det-body">
            <ul>
              <li><strong>Aritmética de presupuesto, no proyección:</strong> ingreso objetivo = tu ingreso actual − partidas que desaparecen + partidas que aumentan. Sin rendimientos, sin inflación, sin tablas de mortalidad: todo en <strong>pesos de hoy</strong>, y el porcentaje es sobre tu ingreso actual.</li>
              <li><strong>Las partidas las llenas tú:</strong> los renglones son un mapa para pensar (transporte laboral, vivienda que se termina de pagar, dependientes, el propio ahorro para el retiro, salud, tiempo libre) — no una inferencia sobre tu vida. Vacíos valen cero.</li>
              <li><strong>El porcentaje resultante es la consecuencia de tu presupuesto</strong>, no un "porcentaje sugerido": esta calculadora no fija metas. Las referencias OIT/OCDE se muestran como contexto documentado.</li>
              <li><strong>Dos caminos a la misma pregunta (declarado):</strong> ésta parte de tu <em>ingreso</em> y lo ajusta; la calculadora de gasto de vida parte del <em>gasto</em> real de los hogares 65+ (ENIGH) y lo editas rubro por rubro. Comparar ambos resultados es un buen control de realidad.</li>
            </ul></div></details>
          <div className="disclaimers">
            <strong>Aviso importante</strong> <span className="hint">(texto dictaminado — revisión legal externa)</span>
            <ul>
              <li>Esta herramienta <strong>no es asesoría financiera</strong> y no sustituye el cálculo oficial del IMSS, de tu AFORE ni de CONSAR. Para tu caso concreto, la constancia de semanas del IMSS y tu estado de cuenta AFORE son la fuente que manda.</li>
              <li>Es una <strong>proyección educativa bajo supuestos declarados</strong>, no una promesa ni una predicción: el resultado cambia si cambian la ley, los rendimientos o tu trayectoria laboral.</li>
              <li><strong>Tus datos no se guardan:</strong> todo se calcula en tu dispositivo y desaparece al cerrar la página.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
