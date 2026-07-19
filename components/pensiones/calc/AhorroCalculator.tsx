"use client";

/* Calculadora de ahorro para el retiro — cuerpo portado TAL CUAL (D8):
   aportación adicional que alcanza una meta de ingreso, gráfica "montaña"
   (trayectoria actual vs con aportación vs capital meta), rAF, tooltip,
   referencias documentadas. Motor en lib/pensiones/calc (aporteParaMeta). */

import { useEffect, useRef } from "react";
import { P, proyectaLey97 } from "@/lib/pensiones/calc/engine";
import { aporteParaMeta, type EntradaAhorro } from "@/lib/pensiones/calc/calculos";
import "./ahorro.css";

export function AhorroCalculator() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const $ = (id: string) => root.querySelector<HTMLElement>("#" + id)!;
    const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fmt = (n: number) => "$" + Math.round(n).toLocaleString("es-MX");
    const fmtK = (n: number) => n >= 1e6 ? "$" + (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + " M" : "$" + Math.round(n / 1000) + " mil";
    const ESC = [
      { k: "conservador", lbl: "Conservador", tasa: "1.5%", color: "var(--text-secondary)" },
      { k: "base", lbl: "Base", tasa: "3.0%", color: "var(--navy)" },
      { k: "optimista", lbl: "Optimista", tasa: "4.5%", color: "var(--gold)" },
    ] as const;

    function leeInputs(): EntradaAhorro {
      return {
        edad: +($("edad") as HTMLInputElement).value,
        sexo: ($("sexo") as unknown as HTMLSelectElement).value as "H" | "M",
        salario: +($("salario") as HTMLInputElement).value,
        saldo: +($("saldo") as HTMLInputElement).value,
        semanas: 0,
        edadRetiro: +($("edadret") as HTMLInputElement).value,
        densidad: +($("densidad") as HTMLInputElement).value / 100,
        voluntaria: +($("voluntaria") as HTMLInputElement).value,
        meta: +($("meta") as HTMLInputElement).value,
      };
    }
    function semaforo(cub: number): [string, string] {
      if (cub >= 1.0) return ["ok", "Meta alcanzada en trayectoria actual"];
      if (cub >= 0.6) return ["mid", "A media construcción"];
      return ["low", "Meta lejana aún"];
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
    type Serie = { edad: number; saldo: number }[];
    function trayectoria(inp: EntradaAhorro, tasa: number, volExtra: number): Serie {
      const out = [{ edad: inp.edad, saldo: inp.saldo }];
      for (let e = inp.edad + 1; e <= inp.edadRetiro; e++)
        out.push({ edad: e, saldo: proyectaLey97({ ...inp, edadRetiro: e, voluntaria: inp.voluntaria + volExtra }, tasa).saldoFinal });
      return out;
    }
    const MT = { W: 660, H: 250, m: { t: 16, r: 74, b: 26, l: 52 } };
    function drawMountain(actual: Serie, conAporte: Serie, cap: number) {
      const svg = $("mtChart");
      const { W, H, m } = MT;
      const iw = W - m.l - m.r, ih = H - m.t - m.b;
      const n = actual.length;
      const maxY = Math.max(cap, conAporte[n - 1].saldo, actual[n - 1].saldo, 1) * 1.08;
      const X = (i: number) => m.l + iw * (n === 1 ? 0 : i / (n - 1));
      const Y = (v: number) => m.t + ih * (1 - v / maxY);
      const path = (arr: Serie) => arr.map((p, i) => (i ? "L" : "M") + X(i).toFixed(1) + "," + Y(p.saldo).toFixed(1)).join("");
      let grid = "", labs = "";
      for (let g = 1; g <= 3; g++) {
        const v = maxY * g / 4, y = Y(v).toFixed(1);
        grid += `<line class="gridline" x1="${m.l}" y1="${y}" x2="${W - m.r}" y2="${y}"/>`;
        labs += `<text class="axis-lbl" x="${m.l - 6}" y="${+y + 3}" text-anchor="end">${fmtK(v)}</text>`;
      }
      const stepX = Math.max(1, Math.ceil(n / 7));
      for (let i = 0; i < n; i += stepX) {
        if (i > n - 1 - stepX * 0.65) continue;
        labs += `<text class="axis-lbl" x="${X(i).toFixed(1)}" y="${H - 8}" text-anchor="middle">${actual[i].edad}</text>`;
      }
      labs += `<text class="axis-lbl" x="${X(n - 1).toFixed(1)}" y="${H - 8}" text-anchor="middle" font-weight="700">${actual[n - 1].edad}</text>`;
      const yCap = Y(cap).toFixed(1);
      const endl = `<text class="endlab" x="${W - m.r + 6}" y="${+yCap + 3.5}" fill="var(--gold)">meta ${fmtK(cap)}</text>`
        + `<text class="endlab" x="${W - m.r + 6}" y="${(Y(actual[n - 1].saldo) + 14).toFixed(1)}" fill="var(--navy)">${fmtK(actual[n - 1].saldo)}</text>`;
      svg.innerHTML = grid + labs
        + `<line x1="${m.l}" y1="${yCap}" x2="${W - m.r}" y2="${yCap}" stroke="var(--gold)" stroke-width="2" stroke-dasharray="6 5"/>`
        + `<path d="${path(conAporte)}" fill="none" stroke="var(--gold-light)" stroke-width="2"/>`
        + `<path d="${path(actual)}" fill="none" stroke="var(--navy)" stroke-width="2.6" stroke-linecap="round"/>`
        + `<circle cx="${X(n - 1)}" cy="${Y(actual[n - 1].saldo)}" r="4" fill="var(--navy)" stroke="#fff" stroke-width="1.5"/>`
        + `<circle cx="${X(n - 1)}" cy="${Y(conAporte[n - 1].saldo)}" r="4" fill="var(--gold)" stroke="#fff" stroke-width="1.5"/>`
        + `<line id="mtGuide" class="guide" y1="${m.t}" y2="${H - m.b}" x1="0" x2="0"/>`
        + endl
        + actual.map((p, i) => `<rect class="hitcol" x="${(X(i) - iw / (Math.max(n - 1, 1)) / 2).toFixed(1)}" y="${m.t}" width="${(iw / Math.max(n - 1, 1)).toFixed(1)}" height="${ih}" data-i="${i}"/>`).join("");
      const tip = $("mtTip"), guide = svg.querySelector<SVGLineElement>("#mtGuide")!;
      svg.querySelectorAll<SVGRectElement>(".hitcol").forEach((r) => {
        const show = () => {
          const i = +r.dataset.i!, p = actual[i];
          tip.innerHTML = `<span class="rh-tip__title">A los ${p.edad} años</span>`
            + `<div class="rh-tip__detail">${fmt(p.saldo)} <span class="dim">trayectoria actual</span></div>`
            + `<div class="rh-tip__detail">${fmt(conAporte[i].saldo)} <span class="dim">con aportación adicional</span></div>`;
          const wrap = $("mtWrap"), sw = wrap.clientWidth / W;
          tip.style.left = X(i) * sw + "px"; tip.style.top = Y(p.saldo) * wrap.clientHeight / H + "px";
          tip.classList.add("is-visible");
          guide.setAttribute("x1", String(X(i))); guide.setAttribute("x2", String(X(i))); guide.classList.add("on");
        };
        const hide = () => { tip.classList.remove("is-visible"); guide.classList.remove("on"); };
        r.addEventListener("mouseenter", show); r.addEventListener("mouseleave", hide);
        r.addEventListener("touchstart", (e) => { e.preventDefault(); show(); }, { passive: false });
      });
      $("mtTable").innerHTML = '<table><thead><tr><th>Edad</th><th>Trayectoria actual</th><th>Con aportación adicional</th></tr></thead><tbody>'
        + actual.map((p, i) => `<tr><td>${p.edad}</td><td>${fmt(p.saldo)}</td><td>${fmt(conAporte[i].saldo)}</td></tr>`).join("")
        + "</tbody></table>";
    }
    let prevBig = 0;
    function render() {
      const inp = leeInputs();
      $("metaVal").textContent = fmt(inp.meta);
      $("voluntariaVal").textContent = fmt(inp.voluntaria);
      $("edadretVal").textContent = inp.edadRetiro + " años";
      $("densidadVal").textContent = Math.round(inp.densidad * 100) + "%";
      ([["meta", 5000, 80000], ["voluntaria", 0, 10000], ["edadret", 60, 70], ["densidad", 10, 100]] as const).forEach(([id, min, max]) => {
        const el = $(id) as HTMLInputElement; el.style.setProperty("--pct", 100 * (+el.value - min) / (max - min) + "%");
      });
      if (!(inp.edad >= 18 && inp.edad < inp.edadRetiro)) { $("bigAporte").innerHTML = "—<small> revisa tu edad</small>"; return; }
      const res = Object.fromEntries(ESC.map((e) => [e.k, aporteParaMeta(inp, P.TASAS[e.k])])) as Record<string, ReturnType<typeof aporteParaMeta>>;
      const rb = res.base;
      const alcanzada = rb.aporte === 0;
      $("bigLbl").textContent = alcanzada
        ? "Tu trayectoria actual ya alcanzaría el capital meta — escenario base (3.0% real)"
        : "Aportación mensual adicional que alcanzaría tu meta — escenario base (3.0% real)";
      const target = rb.aporte;
      tween(prevBig, target, 420, (k) => { $("bigAporte").innerHTML = fmt(lerp(prevBig, target, k)) + "<small> /mes" + (alcanzada ? " — meta cubierta" : " adicionales") + "</small>"; });
      prevBig = target;
      const [cls, txt] = semaforo(rb.cubierto);
      const sem = $("semaforo"); sem.className = "sem " + cls; sem.textContent = txt;
      $("heroSide").innerHTML =
        `<div class="row"><span>Capital que pide tu meta</span><b>${fmt(rb.capitalMeta)}</b></div>`
        + `<div class="row"><span>Saldo proyectado hoy en curso</span><b>${fmt(rb.saldoActual)}</b></div>`
        + `<div class="row"><span>De la meta ya en trayectoria</span><b>≈ ${Math.round(100 * Math.min(rb.cubierto, 9.99))}%</b></div>`
        + `<div class="row" style="border:none"><span>Años para construirla</span><b>${inp.edadRetiro - inp.edad}</b></div>`;
      $("ref40").textContent = fmt(inp.salario * 0.40) + " /mes";
      $("ref63").textContent = fmt(inp.salario * 0.632) + " /mes";
      $("ref80").textContent = fmt(inp.salario * 0.796) + " /mes";
      const actual = trayectoria(inp, P.TASAS.base, 0);
      const conAporte = trayectoria(inp, P.TASAS.base, rb.aporte);
      drawMountain(actual, conAporte, rb.capitalMeta);
      const maxA = Math.max(...ESC.map((e) => res[e.k].aporte), 1) * 1.12;
      $("bars").innerHTML = ESC.map((e) => {
        const r = res[e.k], w = 100 * r.aporte / maxA;
        return `<div class="bar-row" tabindex="0" aria-label="${e.lbl} ${e.tasa}: ${r.aporte === 0 ? "meta cubierta sin aporte adicional" : fmt(r.aporte) + " al mes"}">
          <div class="b-lbl">${e.lbl}<span class="hint">${e.tasa} real</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${Math.max(w, r.aporte > 0 ? 2 : 0).toFixed(1)}%;background:${e.color}"></div></div>
          <div class="bar-val">${r.aporte === 0 ? "cubierta" : fmt(r.aporte)}</div>
        </div>`;
      }).join("");
      const mesesSalario = inp.salario > 0 ? (100 * rb.aporte / inp.salario).toFixed(0) : null;
      let msg: string;
      if (alcanzada) msg = `Con tus datos, la trayectoria que ya llevas (aportaciones obligatorias${inp.voluntaria > 0 ? " más tu ahorro voluntario actual" : ""}) alcanzaría el capital de ${fmt(rb.capitalMeta)} que tu meta de ${fmt(inp.meta)} mensuales pide — en el escenario base. ${res.conservador.aporte > 0 ? "En el escenario conservador harían falta " + fmt(res.conservador.aporte) + " adicionales al mes: el rango entre escenarios es la incertidumbre honesta de esta proyección." : "Incluso en el escenario conservador la meta quedaría cubierta."}`;
      else msg = `Para sostener ${fmt(inp.meta)} mensuales en pesos de hoy desde los ${inp.edadRetiro} años, haría falta un capital de ${fmt(rb.capitalMeta)}. Tu trayectoria actual construiría ${fmt(rb.saldoActual)} (≈${Math.round(100 * rb.cubierto)}% de la meta); la diferencia equivale a aportar ${fmt(rb.aporte)} adicionales al mes${mesesSalario ? " (≈" + mesesSalario + "% de tu salario actual)" : ""} durante los ${inp.edadRetiro - inp.edad} años que faltan — en el escenario base. En el conservador serían ${fmt(res.conservador.aporte)}; en el optimista ${res.optimista.aporte === 0 ? "la meta se cubriría sola" : fmt(res.optimista.aporte)}. La meta es tuya y puedes moverla: la calculadora muestra su consecuencia, no te dice cuánto ahorrar.`;
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
            <h1>¿Cuánto necesitas ahorrar para tu meta de retiro?</h1>
            <p className="sub">Elige el ingreso mensual que quisieras en el retiro y la calculadora te muestra la <strong>aportación adicional</strong> que lo alcanzaría, sobre tu trayectoria obligatoria. En pesos de hoy, con supuestos públicos. La meta es tuya.</p>
          </div>
          <div className="hero-meta">Vigencia de supuestos: <b>2026</b><br />Base: documento actuarial v1.0 · validación actuarial 2026-07-02<br />Tablas EMSSA-09 · tasa técnica 2.5% real</div>
        </header>
        <div className="calc-grid">
          <aside className="panel" id="f">
            <span className="step">Paso 1 · Cuéntanos dónde estás</span>
            <h2>Tus datos</h2>
            <div className="fgrid">
              <div className="field"><label htmlFor="edad">Edad actual</label><input type="number" id="edad" min={18} max={69} defaultValue={35} /></div>
              <div className="field"><label htmlFor="sexo">Sexo <span className="hint">(EMSSA-09 difiere por sexo)</span></label>
                <select id="sexo" defaultValue="H"><option value="H">Hombre</option><option value="M">Mujer</option></select></div>
              <div className="field"><label htmlFor="salario">Salario mensual bruto <span className="hint">aprox. tu SBC</span></label><input type="number" id="salario" min={0} step={500} defaultValue={15000} /></div>
              <div className="field"><label htmlFor="saldo">Saldo en tu AFORE <span className="hint">0 si no lo sabes</span></label><input type="number" id="saldo" min={0} step={1000} defaultValue={120000} /></div>
            </div>
            <div className="slider-block">
              <div className="slider-head"><label htmlFor="meta">Tu meta: ingreso mensual en retiro <span className="hint">en pesos de hoy — abajo hay referencias documentadas</span></label><span className="val" id="metaVal">$12,000</span></div>
              <input type="range" id="meta" min={5000} max={80000} step={500} defaultValue={12000} aria-describedby="metaVal" />
              <div className="slider-scale"><span>$5,000</span><span>$40,000</span><span>$80,000</span></div>
            </div>
            <div className="slider-block">
              <div className="slider-head"><label htmlFor="voluntaria">Ahorro voluntario mensual actual <span className="hint">lo que ya aportas por tu cuenta</span></label><span className="val" id="voluntariaVal">$0</span></div>
              <input type="range" id="voluntaria" min={0} max={10000} step={100} defaultValue={0} aria-describedby="voluntariaVal" />
              <div className="slider-scale"><span>$0</span><span>$5,000</span><span>$10,000</span></div>
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
                <span className="step">Paso 2 · Lo que tu meta pide</span>
                <div className="lbl" id="bigLbl">Aportación mensual adicional que alcanzaría tu meta — escenario base (3.0% real)</div>
                <div className="big" id="bigAporte">$0<small> /mes</small></div>
                <span className="sem mid" id="semaforo">—</span>
              </div>
              <div className="hero-side" id="heroSide"></div>
            </div>
            <div className="card">
              <span className="step">La montaña y las dos rutas</span>
              <h3>Tu saldo proyectado, con y sin la aportación adicional <span className="hint">— escenario base</span></h3>
              <div className="viz-wrap" id="mtWrap">
                <svg id="mtChart" viewBox="0 0 660 250" role="img" aria-label="Trayectoria del saldo con y sin aportación adicional frente al capital meta"></svg>
                <div className="rh-tip" id="mtTip" aria-hidden="true"></div>
              </div>
              <div className="viz-legend">
                <span style={{ color: "var(--gold)" }}><i style={{ borderColor: "var(--gold)", borderTopStyle: "dashed" }}></i>capital meta</span>
                <span style={{ color: "var(--navy)" }}><i style={{ borderColor: "var(--navy)" }}></i>trayectoria actual</span>
                <span><i style={{ borderColor: "var(--gold-light)" }}></i>con aportación adicional</span>
              </div>
              <details style={{ margin: "10px 0 0", border: "none", background: "none" }}><summary style={{ padding: "4px 0", fontSize: "12px" }}>Ver los datos de esta gráfica</summary><div className="det-body scroll" id="mtTable" style={{ padding: "6px 0 2px" }}></div></details>
            </div>
            <div className="card">
              <span className="step">Los tres escenarios</span>
              <h3>La misma meta pide más o menos según el rendimiento de largo plazo</h3>
              <div className="bars" id="bars"></div>
            </div>
            <div className="card refs">
              <span className="step">Referencias documentadas <span className="tag tV">V</span></span>
              <h3>¿De qué tamaño suele plantearse una meta?</h3>
              <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", margin: "4px 0 0" }}>La "tasa de reemplazo" — qué parte de tu salario cubriría tu ingreso de retiro — es la vara documentada más usada para dimensionar una meta. Estas referencias tienen fuente citada; <strong>no son metas del observatorio ni recomendaciones</strong>:</p>
              <div className="scroll"><table>
                <thead><tr><th>Referencia</th><th>Qué es</th><th>Con tu salario</th></tr></thead>
                <tbody>
                  <tr><td><b>40%</b></td><td>Mínimo del Convenio 102 de la OIT (cuadro anexo, parte XI; beneficiario tipo con ~30 años cotizados). México lo ratificó en 1961 incluyendo la parte de vejez.</td><td id="ref40">—</td></tr>
                  <tr><td><b>63%</b></td><td>Promedio OCDE de tasa de reemplazo <em>neta</em> al salario promedio, esquemas obligatorios (Pensions at a Glance 2025, tabla 4.4).</td><td id="ref63">—</td></tr>
                  <tr><td><b>80%</b></td><td>Proyección OCDE para México post-reformas (misma tabla: 79.6%). Ojo: incluye el complemento del Fondo de Pensiones para el Bienestar (2024), <em>fuera del perímetro</em> de esta calculadora.</td><td id="ref80">—</td></tr>
                </tbody>
              </table></div>
              <p>Las equivalencias en pesos se calculan con el salario que escribiste y cambian con él. La meta sigue siendo tuya.</p>
            </div>
            <div className="card">
              <span className="step">Paso 3 · Qué significa</span>
              <h3>Lectura de tu resultado</h3>
              <p className="interp" id="interp"></p>
            </div>
            <div className="card">
              <span className="step">Paso 4 · Siguiente paso</span>
              <h3>Para seguir entendiendo</h3>
              <div className="next">
                <a href="/pensiones/calculadoras/brecha">¿Cómo se ve tu brecha completa? (calculadora de brecha)</a>
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
              <li><strong>La trayectoria obligatoria usa el motor validado de la calculadora de pensión estimada, sin cambios:</strong> aportaciones del art. 168 LSS (patrón 2% retiro + cuota patronal CEAV gradual 2023-2030 + 1.125% del trabajador + cuota social hasta 4 UMA), decreto DOF 16-dic-2020.</li>
              <li><strong>Aportaciones voluntarias:</strong> la LSAR permite aportar a tu cuenta individual en cualquier momento; los retiros de la subcuenta de aportaciones voluntarias tienen reglas de permanencia propias (art. 192, LSAR arts. 74 y 79) — este cálculo no modela retiros anticipados.</li>
            </ul></div></details>
          <details><summary><span className="tag tV">V</span> Datos oficiales vigentes usados</summary><div className="det-body">
            <ul>
              <li>UMA 2026: $117.31 diaria (INEGI, DOF 09-ene-2026) · Salario mínimo 2026: $315.04 diario (CONASAMI, DOF 09-dic-2025).</li>
              <li>Tablas EMSSAH-09/EMSSAM-09 (CNSF, DOF 14-ago-2009, Anexo 4) para el capital meta.</li>
              <li>Referencias de tasas de reemplazo: ver la tarjeta "Referencias documentadas" (fuentes citadas ahí mismo).</li>
            </ul></div></details>
          <details><summary><span className="tag tS">S</span> Supuestos de proyección declarados <span className="hint">— escenario ilustrativo</span></summary><div className="det-body">
            <ul>
              <li><strong>Rendimiento real neto:</strong> tres escenarios — conservador 1.5%, base 3.0%, optimista 4.5% anual. <em>Parámetros de escenario ilustrativo.</em> Todo en pesos de hoy.</li>
              <li><strong>Capital meta</strong> = tu ingreso mensual meta × el divisor de anualización EMSSA-09 (tasa técnica 2.5% real, validación actuarial 2026-07-02) — el capital que sostendría esa renta vitalicia actualizable con inflación. Es el mismo factor validado de la calculadora de pensión (S7).</li>
              <li><strong>Aportación adicional:</strong> se calcula con la misma convención de la trayectoria (aportes durante el año, capitalización anual al cierre) — es el monto constante en pesos de hoy que, sumado a tu trayectoria, llega exactamente al capital meta en tu edad de retiro. No es una recomendación: es la consecuencia aritmética de la meta que elegiste.</li>
              <li><strong>Crecimiento de tu salario:</strong> +1.0% real anual · <strong>Constancia:</strong> la eliges tú (presets ilustrativos 90/60/40).</li>
              <li><strong>Semáforo:</strong> % del capital meta que tu trayectoria actual ya alcanzaría (escenario base) — 100%+ "meta alcanzada", 60-100% "a media construcción", &lt;60% "meta lejana aún". Umbrales metodológicos, públicos y discutibles.</li>
              <li><strong>Sin semanas ni elegibilidad:</strong> esta calculadora habla del <em>saldo</em>; los requisitos de pensión (semanas, edad) son tema de la calculadora de pensión estimada. Proyección de saldo pura, declarada.</li>
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
