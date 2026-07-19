"use client";

/* Calculadora de brecha de retiro — cuerpo portado TAL CUAL (D8): gasto
   deseado vs ingreso proyectado, "puente" de segmentos (pensión/otros/brecha)
   por escenario con tooltip, capital equivalente, nota PMG. Motor en
   lib/pensiones/calc (calculaBrecha). */

import { useEffect, useRef } from "react";
import { P, pmgAplicable } from "@/lib/pensiones/calc/engine";
import { calculaBrecha, type EntradaBrecha } from "@/lib/pensiones/calc/calculos";
import "./brecha.css";

export function BrechaCalculator() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const $ = (id: string) => root.querySelector<HTMLElement>("#" + id)!;
    const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fmt = (n: number) => "$" + Math.round(n).toLocaleString("es-MX");
    const ESC = [
      { k: "conservador", lbl: "Conservador", tasa: "1.5%" },
      { k: "base", lbl: "Base", tasa: "3.0%" },
      { k: "optimista", lbl: "Optimista", tasa: "4.5%" },
    ] as const;

    function leeInputs(): EntradaBrecha {
      return {
        edad: +($("edad") as HTMLInputElement).value,
        sexo: ($("sexo") as unknown as HTMLSelectElement).value as "H" | "M",
        salario: +($("salario") as HTMLInputElement).value,
        saldo: +($("saldo") as HTMLInputElement).value,
        semanas: +($("semanas") as HTMLInputElement).value,
        pre97: root!.querySelector<HTMLInputElement>("input[name=pre97]:checked")!.value === "si",
        edadRetiro: +($("edadret") as HTMLInputElement).value,
        densidad: +($("densidad") as HTMLInputElement).value / 100,
        gasto: +($("gasto") as HTMLInputElement).value,
        otros: +($("otros") as HTMLInputElement).value,
        voluntaria: 0,
      };
    }
    function semaforo(cob: number): [string, string] {
      if (cob >= 1.0) return ["ok", "Cubierto en este escenario"];
      if (cob >= 0.7) return ["mid", "Brecha moderada"];
      return ["low", "Brecha grande"];
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
    let prevBig = 0;
    function render() {
      const inp = leeInputs();
      $("gastoVal").textContent = fmt(inp.gasto);
      $("otrosVal").textContent = fmt(inp.otros);
      $("edadretVal").textContent = inp.edadRetiro + " años";
      $("densidadVal").textContent = Math.round(inp.densidad * 100) + "%";
      ([["gasto", 5000, 80000], ["otros", 0, 50000], ["edadret", 60, 70], ["densidad", 10, 100]] as const).forEach(([id, min, max]) => {
        const el = $(id) as HTMLInputElement; el.style.setProperty("--pct", 100 * (+el.value - min) / (max - min) + "%");
      });
      if (!(inp.edad >= 18 && inp.edad < inp.edadRetiro)) { $("bigBrecha").innerHTML = "—<small> revisa tu edad</small>"; return; }
      const res = Object.fromEntries(ESC.map((e) => [e.k, calculaBrecha(inp, P.TASAS[e.k])])) as Record<string, ReturnType<typeof calculaBrecha>>;
      const rb = res.base;
      const esBrecha = rb.brecha > 0;
      $("bigLbl").textContent = (esBrecha ? "Brecha mensual" : "Excedente mensual") + " — escenario base (3.0% real), en pesos de hoy";
      const target = Math.abs(rb.brecha);
      tween(prevBig, target, 420, (k) => { $("bigBrecha").innerHTML = fmt(lerp(prevBig, target, k)) + "<small> /mes " + (esBrecha ? "faltante" : "a favor") + "</small>"; });
      prevBig = target;
      const [cls, txt] = semaforo(rb.cobertura);
      const sem = $("semaforo"); sem.className = "sem " + cls; sem.textContent = txt;
      $("heroSide").innerHTML =
        `<div class="row"><span>Pensión proyectada (${rb.regimen})</span><b>${fmt(rb.pension)}</b></div>`
        + `<div class="row"><span>Otros ingresos</span><b>${fmt(inp.otros)}</b></div>`
        + `<div class="row"><span>Gasto deseado</span><b>${fmt(inp.gasto)}</b></div>`
        + `<div class="row" style="border:none"><span>Cobertura (base)</span><b>≈ ${Math.round(100 * rb.cobertura)}%</b></div>`;
      $("eligWarn").innerHTML = rb.r97.elegible ? "" :
        `<div class="note alert"><strong>Con estos datos no alcanzarías el requisito de semanas.</strong> Al retirarte en ${rb.r97.anioRetiro} la ley pide <strong>${rb.r97.reqSemanas} semanas</strong> y tu proyección llega a <strong>${rb.r97.semanasFinales}</strong>. La "pensión proyectada" muestra <em>el ingreso mensual que tu saldo podría sostener</em> si cumplieras el requisito; sin él, no hay pensión de cesantía/vejez a esa fecha. Mueve la constancia de cotización o la edad de retiro para ver cómo cambia.</div>`;
      const maxV = Math.max(inp.gasto, ...ESC.map((e) => res[e.k].ingreso)) * 1.08;
      const pct = (v: number) => 100 * v / maxV;
      $("bridge").innerHTML = ESC.map((e) => {
        const r = res[e.k];
        const wp = pct(r.pension), wo = pct(inp.otros);
        const gap = Math.max(0, inp.gasto - r.ingreso);
        const wg = pct(gap);
        return `<div class="br-row" tabindex="0" data-k="${e.k}" aria-label="${e.lbl} ${e.tasa}: pensión ${fmt(r.pension)}, otros ${fmt(inp.otros)}, ${gap > 0 ? "brecha " + fmt(gap) : "sin brecha"}">
          <div class="b-lbl">${e.lbl}<span class="hint">${e.tasa} real</span></div>
          <div class="br-track">
            <div class="seg pen" style="left:0;width:${wp.toFixed(2)}%"></div>
            <div class="seg otr" style="left:${wp.toFixed(2)}%;width:${wo.toFixed(2)}%"></div>
            ${gap > 0 ? `<div class="seg gap" style="left:${(wp + wo).toFixed(2)}%;width:${wg.toFixed(2)}%"></div>` : ""}
            ${e.k === "conservador" ? `<div class="refline" style="left:${pct(inp.gasto).toFixed(2)}%"><span class="reflab">Tu gasto deseado · ${fmt(inp.gasto)}</span></div>` : `<div class="refline" style="left:${pct(inp.gasto).toFixed(2)}%"></div>`}
          </div>
          <div class="br-val">${gap > 0 ? fmt(gap) : "+" + fmt(r.ingreso - inp.gasto)}<span class="hint">${gap > 0 ? "faltante" : "a favor"}</span></div>
        </div>`;
      }).join("");
      const tip = $("brTip"), wrap = $("bridgeWrap");
      root!.querySelectorAll<HTMLElement>(".br-row").forEach((rowEl) => {
        const show = () => {
          const r = res[rowEl.dataset.k!];
          const gap = Math.max(0, inp.gasto - r.ingreso);
          tip.innerHTML = `<span class="rh-tip__title">${rowEl.dataset.k!.toUpperCase()} - escenario</span>`
            + `<div class="rh-tip__detail">${fmt(r.pension)} <span class="dim">pensión (${r.regimen})</span></div>`
            + `<div class="rh-tip__detail">${fmt(inp.otros)} <span class="dim">otros ingresos</span></div>`
            + `<div class="rh-tip__detail">${gap > 0 ? fmt(gap) + " " : fmt(r.ingreso - inp.gasto) + " "}<span class="dim">${gap > 0 ? "faltante /mes" : "a favor /mes"}</span></div>`;
          const rr = rowEl.getBoundingClientRect(), wr = wrap.getBoundingClientRect();
          tip.style.left = rr.left - wr.left + rr.width * 0.5 + "px";
          tip.style.top = rr.top - wr.top + 4 + "px";
          tip.classList.add("is-visible");
        };
        const hide = () => tip.classList.remove("is-visible");
        rowEl.addEventListener("mouseenter", show); rowEl.addEventListener("mouseleave", hide);
        rowEl.addEventListener("focus", show); rowEl.addEventListener("blur", hide);
      });
      if (esBrecha) {
        $("capitalBox").style.display = "";
        $("capitalBox").innerHTML = `<span class="step">La brecha, vista como capital</span>
          <h3>Capital adicional que sostendría ese faltante</h3>
          <div class="bigcap">${fmt(rb.capitalBrecha)} <span class="hint">al momento de retirarte (escenario base)</span></div>
          <p>Es la brecha mensual × el divisor de anualización EMSSA-09 (tasa técnica 2.5% real, validación actuarial 2026-07-02): el capital que, convertido en renta vitalicia actualizable con inflación, cubriría el faltante. En los otros escenarios:</p>
          <div class="cap-range">
            <span>conservador <b>${fmt(res.conservador.capitalBrecha)}</b></span>
            <span>optimista <b>${res.optimista.brecha > 0 ? fmt(res.optimista.capitalBrecha) : "sin brecha"}</b></span>
          </div>`;
      } else {
        $("capitalBox").style.display = res.conservador.brecha > 0 ? "" : "none";
        if (res.conservador.brecha > 0) {
          $("capitalBox").innerHTML = `<span class="step">La brecha, vista como capital</span>
            <h3>En el escenario base no hay faltante — en el conservador sí</h3>
            <div class="bigcap">${fmt(res.conservador.capitalBrecha)} <span class="hint">capital equivalente, escenario conservador</span></div>
            <p>Si los rendimientos de largo plazo resultan bajos (1.5% real), quedaría una brecha de ${fmt(res.conservador.brecha)} al mes. El rango entre escenarios es la incertidumbre honesta de esta proyección.</p>`;
        }
      }
      const pmg = pmgAplicable(inp.edadRetiro, rb.r97.semanasFinales, inp.salario, rb.r97.anioRetiro);
      let pmgHTML = "";
      if (pmg.aplica && rb.pension < pmg.mensual) {
        const brechaPMG = Math.max(0, inp.gasto - (pmg.mensual + inp.otros));
        pmgHTML = `<div class="note">Para tu caso (retiro a los ${inp.edadRetiro} con ${rb.r97.semanasFinales.toLocaleString("es-MX")} semanas, tu salario como aproximación del promedio de tu vida laboral), la <strong>pensión garantizada</strong> es de <strong>${fmt(pmg.mensual)} al mes</strong> en pesos de hoy (LSS art. 170: matriz oficial del decreto DOF 16-dic-2020, actualizada por INPC). Tu pensión proyectada (${fmt(rb.pension)}) queda por debajo: cumpliendo edad y semanas, el Estado cubre la diferencia hasta ese mínimo — con esa garantía, ${brechaPMG > 0 ? `la brecha bajaría a <strong>${fmt(brechaPMG)}</strong> al mes` : `tu gasto deseado quedaría cubierto sin brecha`}.</div>`;
      } else if (pmg.aplica && rb.pension < pmg.mensual * 1.15) {
        pmgHTML = `<div class="note">Tu pensión proyectada (${fmt(rb.pension)}) queda apenas arriba de la <strong>pensión garantizada</strong> de tu caso: <strong>${fmt(pmg.mensual)} al mes</strong> en pesos de hoy (LSS art. 170, matriz oficial actualizada por INPC). Ese es el piso que el Estado asegura cumpliendo edad y semanas.</div>`;
      }
      $("pmgNote").innerHTML = pmgHTML;
      const cobPct = Math.round(100 * rb.cobertura);
      let msg: string;
      if (!esBrecha) msg = `En el escenario base, tu pensión proyectada (${fmt(rb.pension)}) más tus otros ingresos cubrirían tu gasto deseado de ${fmt(inp.gasto)} con ${fmt(rb.ingreso - inp.gasto)} de margen al mes. ${res.conservador.brecha > 0 ? "En el escenario conservador sí aparecería una brecha de " + fmt(res.conservador.brecha) + " — el rango entre escenarios es la incertidumbre honesta de esta proyección." : "Incluso en el escenario conservador no aparece brecha con estos datos."}`;
      else msg = `En el escenario base, entre tu pensión proyectada (${fmt(rb.pension)}, ${rb.regimen}) y tus otros ingresos reunirías ${fmt(rb.ingreso)} de los ${fmt(inp.gasto)} que deseas gastar al mes: una cobertura de ≈${cobPct}%. La brecha de ${fmt(rb.brecha)} mensuales equivale a un capital de ${fmt(rb.capitalBrecha)} al retirarte. Cada control es una decisión o circunstancia tuya — mover el gasto deseado, la edad de retiro o la constancia cambia el tamaño del puente. La calculadora muestra la distancia, no te dice qué hacer.`;
      $("interp").textContent = msg;
    }
    const handlers: Array<[Element, () => void]> = [];
    root.querySelectorAll<HTMLElement>("#f input, #f select").forEach((el) => {
      const h = () => {
        render();
        if ((el as HTMLInputElement).type === "range") {
          const v = root!.querySelector<HTMLElement>("#" + el.id + "Val");
          if (v) { v.classList.add("bump"); clearTimeout((v as unknown as { _t: number })._t); (v as unknown as { _t: number })._t = window.setTimeout(() => v.classList.remove("bump"), 350); }
        }
      };
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
            <h1>¿Qué tan cerca está el retiro que quieres del que llevas construido?</h1>
            <p className="sub">Compara el <strong>gasto mensual que deseas</strong> en tu retiro contra el ingreso que tu trayectoria IMSS y tus otros ingresos sostendrían, en <strong>pesos de hoy</strong> y bajo tres escenarios. Esto informa — las decisiones son tuyas.</p>
          </div>
          <div className="hero-meta">Vigencia de supuestos: <b>2026</b><br />Base: documento actuarial v1.0 + supuestos incrementales<br />Motor de pensión: idéntico al de la calculadora de pensión (validado)</div>
        </header>
        <div className="calc-grid">
          <aside className="panel" id="f">
            <span className="step">Paso 1 · Cuéntanos dónde estás</span>
            <h2>Tus datos</h2>
            <div className="fgrid">
              <div className="field"><label htmlFor="edad">Edad actual</label><input type="number" id="edad" min={18} max={69} defaultValue={45} /></div>
              <div className="field"><label htmlFor="sexo">Sexo <span className="hint">(EMSSA-09 difiere por sexo)</span></label>
                <select id="sexo" defaultValue="H"><option value="H">Hombre</option><option value="M">Mujer</option></select></div>
              <div className="field"><label htmlFor="salario">Salario mensual bruto <span className="hint">aprox. tu SBC</span></label><input type="number" id="salario" min={0} step={500} defaultValue={18000} /></div>
              <div className="field"><label htmlFor="saldo">Saldo en tu AFORE <span className="hint">0 si no lo sabes</span></label><input type="number" id="saldo" min={0} step={1000} defaultValue={300000} /></div>
              <div className="field"><label htmlFor="semanas">Semanas cotizadas</label><input type="number" id="semanas" min={0} max={3000} defaultValue={900} /></div>
              <div className="field"><label>¿Cotizaste antes de jul-1997?</label>
                <div className="radio-row" role="radiogroup">
                  <label><input type="radio" name="pre97" value="no" defaultChecked /> No</label>
                  <label><input type="radio" name="pre97" value="si" /> Sí</label>
                </div></div>
            </div>
            <div className="slider-block">
              <div className="slider-head"><label htmlFor="gasto">Gasto mensual que deseas en tu retiro <span className="hint">tu meta de vida, en pesos de hoy</span></label><span className="val" id="gastoVal">$15,000</span></div>
              <input type="range" id="gasto" min={5000} max={80000} step={500} defaultValue={15000} aria-describedby="gastoVal" />
              <div className="slider-scale"><span>$5,000</span><span>$40,000</span><span>$80,000</span></div>
            </div>
            <div className="slider-block">
              <div className="slider-head"><label htmlFor="otros">Otros ingresos mensuales esperados <span className="hint">rentas, negocio, apoyos — sin contar tu pensión</span></label><span className="val" id="otrosVal">$0</span></div>
              <input type="range" id="otros" min={0} max={50000} step={500} defaultValue={0} aria-describedby="otrosVal" />
              <div className="slider-scale"><span>$0</span><span>$25,000</span><span>$50,000</span></div>
            </div>
            <div className="slider-block">
              <div className="slider-head"><label htmlFor="edadret">Edad de retiro</label><span className="val" id="edadretVal">65 años</span></div>
              <input type="range" id="edadret" min={60} max={70} step={1} defaultValue={65} aria-describedby="edadretVal" />
              <div className="slider-scale"><span>60</span><span>65</span><span>70</span></div>
            </div>
            <div className="slider-block">
              <div className="slider-head"><label htmlFor="densidad">Constancia de cotización <span className="hint">parte del tiempo restante cotizando</span></label><span className="val" id="densidadVal">90%</span></div>
              <input type="range" id="densidad" min={10} max={100} step={5} defaultValue={90} aria-describedby="densidadVal" />
              <div className="slider-scale"><span>intermitente 40</span><span>mixto 60</span><span>continuo 90</span></div>
            </div>
          </aside>
          <section className="results">
            <div className="card hero-res">
              <div>
                <span className="step">Paso 2 · Tu brecha</span>
                <div className="lbl" id="bigLbl">Brecha mensual — escenario base (3.0% real), en pesos de hoy</div>
                <div className="big" id="bigBrecha">$0<small> /mes</small></div>
                <span className="sem mid" id="semaforo">—</span>
              </div>
              <div className="hero-side" id="heroSide"></div>
            </div>
            <div id="eligWarn"></div>
            <div className="card">
              <span className="step">El puente hacia tu gasto deseado</span>
              <h3>Lo que sostendría tu plan frente a lo que quieres gastar <span className="hint">— tres escenarios de rendimiento</span></h3>
              <div className="viz-wrap" id="bridgeWrap">
                <div className="bridge" id="bridge"></div>
                <div className="rh-tip" id="brTip" aria-hidden="true"></div>
              </div>
              <div className="viz-legend">
                <span><i style={{ background: "var(--navy)" }}></i>pensión proyectada</span>
                <span><i style={{ background: "var(--gold)" }}></i>otros ingresos</span>
                <span><i style={{ background: "repeating-linear-gradient(45deg,rgba(158,43,37,.20) 0 5px,rgba(158,43,37,.05) 5px 10px)", border: "1.5px dashed var(--low)" }}></i>brecha faltante</span>
              </div>
            </div>
            <div className="card capital" id="capitalBox"></div>
            <div id="pmgNote"></div>
            <div className="card">
              <span className="step">Paso 3 · Qué significa</span>
              <h3>Lectura de tu resultado</h3>
              <p className="interp" id="interp"></p>
            </div>
            <div className="card">
              <span className="step">Paso 4 · Siguiente paso</span>
              <h3>Para seguir entendiendo</h3>
              <div className="next">
                <a href="/pensiones/calculadoras/ahorro">¿Qué aportación cerraría esta brecha? (calculadora de ahorro)</a>
                <a href="/pensiones/calculadoras/pension">Tu proyección completa (calculadora de pensión)</a>
                <a href="#supuestos">Metodología y supuestos</a>
              </div>
            </div>
          </section>
        </div>
        <div className="lower">
          <h2 id="supuestos" style={{ fontFamily: "Merriweather,Georgia,serif", color: "var(--navy)", fontSize: "19px", margin: "0 0 4px" }}>Metodología y supuestos <span className="hint">— vigencia: 2026 · documento base actuarial v1.0</span></h2>
          <details><summary><span className="tag tR">R</span> Reglas de ley que aplica el cálculo (fuentes oficiales versionadas)</summary><div className="det-body">
            <ul>
              <li><strong>La pensión proyectada usa el motor validado de la calculadora de pensión estimada, sin cambios:</strong> requisitos de semanas en transición 750→1,000 (decreto DOF 16-dic-2020), aportaciones del art. 168 LSS con cuota patronal gradual 2023-2030, cuota social, divisores EMSSA-09 a tasa técnica 2.5% real, y —si cotizaste antes de jul-1997— la fórmula de la Ley 73 (arts. 167, 171, 164, 168, 169) tomando el esquema que te resulte mayor (transitorio Tercero).</li>
              <li><strong>Pensión garantizada (art. 170):</strong> matriz oficial completa integrada (decreto DOF 16-dic-2020, transcrita con doble verificación independiente y actualizada a pesos de hoy por INPC) — cuando tu pensión proyectada queda bajo el mínimo de tu caso, la calculadora muestra el monto exacto y la brecha que quedaría con esa garantía.</li>
            </ul></div></details>
          <details><summary><span className="tag tV">V</span> Datos oficiales vigentes usados</summary><div className="det-body">
            <ul>
              <li>UMA 2026: $117.31 diaria (INEGI, DOF 09-ene-2026) · Salario mínimo 2026: $315.04 diario (CONASAMI, DOF 09-dic-2025).</li>
              <li>Tablas de supervivencia EMSSAH-09/EMSSAM-09 (CNSF, DOF 14-ago-2009, Anexo 4) — divisores de anualización publicados en la calculadora de pensión.</li>
            </ul></div></details>
          <details><summary><span className="tag tS">S</span> Supuestos de proyección declarados <span className="hint">— escenario ilustrativo</span></summary><div className="det-body">
            <ul>
              <li><strong>Rendimiento real neto:</strong> tres escenarios — conservador 1.5%, base 3.0%, optimista 4.5% anual. <em>Parámetros de escenario ilustrativo.</em> Todo en pesos de hoy.</li>
              <li><strong>Gasto deseado y otros ingresos:</strong> los eliges tú; se asumen constantes en términos reales durante el retiro (declarado).</li>
              <li><strong>Capital equivalente de la brecha:</strong> brecha mensual × divisor de anualización EMSSA-09 (2.5% real) — es el capital que sostendría ese faltante como renta vitalicia actualizable con inflación; mismo factor validado actuarialmente que usa la calculadora de pensión (S7).</li>
              <li><strong>Sin ahorro voluntario adicional:</strong> esta calculadora proyecta tu trayectoria obligatoria tal como va; el efecto de aportar más es tema de la <a href="/pensiones/calculadoras/ahorro">calculadora de ahorro</a> (separación deliberada para que cada número cuente una sola historia).</li>
              <li><strong>Semáforo de cobertura:</strong> ingreso proyectado ÷ gasto deseado — 100%+ "cubierto en este escenario", 70-100% "brecha moderada", &lt;70% "brecha grande". Umbrales metodológicos, públicos y discutibles.</li>
              <li><strong>Ley 73:</strong> tu salario actual aproxima el promedio de tus últimas 250 semanas (declarado).</li>
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
