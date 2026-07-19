"use client";

/* Calculadora de aportaciones voluntarias — cuerpo portado TAL CUAL (D8): la
   consecuencia de una aportación adicional (saldo y pensión extra), barra
   split bolsillo/rendimiento, gráfica de dos rutas con banda, rAF, tooltip.
   Motor en lib/pensiones/calc (impactoAporte). */

import { useEffect, useRef } from "react";
import { P, proyectaLey97 } from "@/lib/pensiones/calc/engine";
import { impactoAporte, type EntradaAportaciones } from "@/lib/pensiones/calc/calculos";
import "./aportaciones.css";

export function AportacionesCalculator() {
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

    function leeInputs(): EntradaAportaciones {
      return {
        edad: +($("edad") as HTMLInputElement).value,
        sexo: ($("sexo") as unknown as HTMLSelectElement).value as "H" | "M",
        salario: +($("salario") as HTMLInputElement).value,
        saldo: +($("saldo") as HTMLInputElement).value,
        semanas: 0,
        edadRetiro: +($("edadret") as HTMLInputElement).value,
        densidad: +($("densidad") as HTMLInputElement).value / 100,
        voluntaria: +($("voluntaria") as HTMLInputElement).value,
        extra: +($("extra") as HTMLInputElement).value,
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
    type Serie = { edad: number; saldo: number }[];
    function trayectoria(inp: EntradaAportaciones, tasa: number, volExtra: number): Serie {
      const out = [{ edad: inp.edad, saldo: inp.saldo }];
      for (let e = inp.edad + 1; e <= inp.edadRetiro; e++)
        out.push({ edad: e, saldo: proyectaLey97({ ...inp, edadRetiro: e, voluntaria: inp.voluntaria + volExtra }, tasa).saldoFinal });
      return out;
    }
    const MT = { W: 660, H: 250, m: { t: 16, r: 74, b: 26, l: 52 } };
    function drawDosRutas(sin: Serie, con: Serie) {
      const svg = $("mtChart");
      const { W, H, m } = MT;
      const iw = W - m.l - m.r, ih = H - m.t - m.b;
      const n = sin.length;
      const maxY = Math.max(con[n - 1].saldo, sin[n - 1].saldo, 1) * 1.08;
      const X = (i: number) => m.l + iw * (n === 1 ? 0 : i / (n - 1));
      const Y = (v: number) => m.t + ih * (1 - v / maxY);
      const path = (arr: Serie) => arr.map((p, i) => (i ? "L" : "M") + X(i).toFixed(1) + "," + Y(p.saldo).toFixed(1)).join("");
      const band = con.map((p, i) => (i ? "L" : "M") + X(i).toFixed(1) + "," + Y(p.saldo).toFixed(1)).join("")
        + sin.slice().reverse().map((p, i) => "L" + X(n - 1 - i).toFixed(1) + "," + Y(p.saldo).toFixed(1)).join("") + "Z";
      let grid = "", labs = "";
      for (let g = 1; g <= 3; g++) {
        const v = maxY * g / 4, y = Y(v).toFixed(1);
        grid += `<line class="gridline" x1="${m.l}" y1="${y}" x2="${W - m.r}" y2="${y}"/>`;
        labs += `<text class="axis-lbl" x="${m.l - 6}" y="${+y + 3}" text-anchor="end">${fmtK(v)}</text>`;
      }
      const stepX = Math.max(1, Math.ceil(n / 7));
      for (let i = 0; i < n; i += stepX) {
        if (i > n - 1 - stepX * 0.65) continue;
        labs += `<text class="axis-lbl" x="${X(i).toFixed(1)}" y="${H - 8}" text-anchor="middle">${sin[i].edad}</text>`;
      }
      labs += `<text class="axis-lbl" x="${X(n - 1).toFixed(1)}" y="${H - 8}" text-anchor="middle" font-weight="700">${sin[n - 1].edad}</text>`;
      const endl = `<text class="endlab" x="${W - m.r + 6}" y="${(Y(con[n - 1].saldo) + 3.5).toFixed(1)}" fill="var(--gold)">${fmtK(con[n - 1].saldo)}</text>`
        + `<text class="endlab" x="${W - m.r + 6}" y="${(Y(sin[n - 1].saldo) + (Math.abs(Y(sin[n - 1].saldo) - Y(con[n - 1].saldo)) < 12 ? 16 : 3.5)).toFixed(1)}" fill="var(--navy)">${fmtK(sin[n - 1].saldo)}</text>`;
      svg.innerHTML = grid + labs
        + `<path d="${band}" fill="rgba(180,83,9,.13)"/>`
        + `<path d="${path(sin)}" fill="none" stroke="var(--navy)" stroke-width="2.6" stroke-linecap="round"/>`
        + `<path d="${path(con)}" fill="none" stroke="var(--gold)" stroke-width="2"/>`
        + `<circle cx="${X(n - 1)}" cy="${Y(sin[n - 1].saldo)}" r="4" fill="var(--navy)" stroke="#fff" stroke-width="1.5"/>`
        + `<circle cx="${X(n - 1)}" cy="${Y(con[n - 1].saldo)}" r="4" fill="var(--gold)" stroke="#fff" stroke-width="1.5"/>`
        + `<line id="mtGuide" class="guide" y1="${m.t}" y2="${H - m.b}" x1="0" x2="0"/>`
        + endl
        + sin.map((p, i) => `<rect class="hitcol" x="${(X(i) - iw / (Math.max(n - 1, 1)) / 2).toFixed(1)}" y="${m.t}" width="${(iw / Math.max(n - 1, 1)).toFixed(1)}" height="${ih}" data-i="${i}"/>`).join("");
      const tip = $("mtTip"), guide = svg.querySelector<SVGLineElement>("#mtGuide")!;
      svg.querySelectorAll<SVGRectElement>(".hitcol").forEach((r) => {
        const show = () => {
          const i = +r.dataset.i!, p = sin[i];
          tip.innerHTML = `<span class="rh-tip__title">A los ${p.edad} años</span>`
            + `<div class="rh-tip__detail">${fmt(con[i].saldo)} <span class="dim">con aportación</span></div>`
            + `<div class="rh-tip__detail">${fmt(p.saldo)} <span class="dim">sin aportación</span></div>`
            + `<div class="rh-tip__detail">${fmt(con[i].saldo - p.saldo)} <span class="dim">diferencia</span></div>`;
          const wrap = $("mtWrap"), sw = wrap.clientWidth / W;
          tip.style.left = X(i) * sw + "px"; tip.style.top = Y(con[i].saldo) * wrap.clientHeight / H + "px";
          tip.classList.add("is-visible");
          guide.setAttribute("x1", String(X(i))); guide.setAttribute("x2", String(X(i))); guide.classList.add("on");
        };
        const hide = () => { tip.classList.remove("is-visible"); guide.classList.remove("on"); };
        r.addEventListener("mouseenter", show); r.addEventListener("mouseleave", hide);
        r.addEventListener("touchstart", (e) => { e.preventDefault(); show(); }, { passive: false });
      });
      $("mtTable").innerHTML = '<table><thead><tr><th>Edad</th><th>Sin aportación adicional</th><th>Con aportación adicional</th><th>Diferencia</th></tr></thead><tbody>'
        + sin.map((p, i) => `<tr><td>${p.edad}</td><td>${fmt(p.saldo)}</td><td>${fmt(con[i].saldo)}</td><td>${fmt(con[i].saldo - p.saldo)}</td></tr>`).join("")
        + "</tbody></table>";
    }
    let prevBig = 0;
    function render() {
      const inp = leeInputs();
      $("extraVal").textContent = fmt(inp.extra);
      $("voluntariaVal").textContent = fmt(inp.voluntaria);
      $("edadretVal").textContent = inp.edadRetiro + " años";
      $("densidadVal").textContent = Math.round(inp.densidad * 100) + "%";
      ([["extra", 100, 5000], ["voluntaria", 0, 10000], ["edadret", 60, 70], ["densidad", 10, 100]] as const).forEach(([id, min, max]) => {
        const el = $(id) as HTMLInputElement; el.style.setProperty("--pct", 100 * (+el.value - min) / (max - min) + "%");
      });
      if (!(inp.edad >= 18 && inp.edad < inp.edadRetiro)) { $("bigExtra").innerHTML = "—<small> revisa tu edad</small>"; return; }
      const res = Object.fromEntries(ESC.map((e) => [e.k, impactoAporte(inp, P.TASAS[e.k])])) as Record<string, ReturnType<typeof impactoAporte>>;
      const rb = res.base;
      const target = rb.saldoExtra;
      tween(prevBig, target, 420, (k) => { $("bigExtra").innerHTML = fmt(lerp(prevBig, target, k)) + "<small> más en tu saldo</small>"; });
      prevBig = target;
      $("pensionExtraLbl").innerHTML = `Equivale a <strong style="color:#fff">${fmt(rb.pensionExtra)}</strong> más de pensión mensual, en pesos de hoy`;
      const anios = inp.edadRetiro - inp.edad;
      $("heroSide").innerHTML =
        `<div class="row"><span>Aportarías de tu bolsillo</span><b>${fmt(rb.aportado)}</b></div>`
        + `<div class="row"><span>Lo pondría el rendimiento</span><b>${fmt(rb.rendimiento)}</b></div>`
        + `<div class="row"><span>Saldo al retiro con el extra</span><b>${fmt(rb.con)}</b></div>`
        + `<div class="row" style="border:none"><span>Años del hábito</span><b>${anios}</b></div>`;
      const pctB = 100 * rb.aportado / Math.max(rb.saldoExtra, 1);
      $("split").innerHTML =
        `<div class="seg" style="width:${Math.min(pctB, 100).toFixed(1)}%;background:var(--navy)"></div>`
        + `<div class="seg" style="width:${Math.max(100 - pctB, 0).toFixed(1)}%;background:var(--gold)"></div>`;
      $("splitLeg").innerHTML =
        `<span><i style="background:var(--navy)"></i>Tu bolsillo: <b>${fmt(rb.aportado)}</b> (${fmt(inp.extra)} × 12 × ${anios} años)</span>`
        + `<span><i style="background:var(--gold)"></i>Rendimiento compuesto: <b>${fmt(rb.rendimiento)}</b> (${Math.max(100 - pctB, 0).toFixed(0)}% del monto extra)</span>`;
      drawDosRutas(trayectoria(inp, P.TASAS.base, 0), trayectoria(inp, P.TASAS.base, inp.extra));
      const maxV = Math.max(...ESC.map((e) => res[e.k].saldoExtra), 1) * 1.12;
      $("bars").innerHTML = ESC.map((e) => {
        const r = res[e.k], w = 100 * r.saldoExtra / maxV;
        return `<div class="bar-row" tabindex="0" aria-label="${e.lbl} ${e.tasa}: ${fmt(r.saldoExtra)} de saldo adicional, ${fmt(r.pensionExtra)} de pensión mensual extra">
          <div class="b-lbl">${e.lbl}<span class="hint">${e.tasa} real</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${w.toFixed(1)}%;background:${e.color}"></div></div>
          <div class="bar-val">${fmt(r.saldoExtra)}</div>
        </div>`;
      }).join("");
      const veces = rb.aportado > 0 ? (rb.saldoExtra / rb.aportado) : 0;
      $("interp").textContent = `Aportar ${fmt(inp.extra)} adicionales al mes durante ${anios} años sumaría ${fmt(rb.saldoExtra)} a tu saldo en el escenario base — de ese monto, ${fmt(rb.aportado)} saldrían de tu bolsillo y ${fmt(rb.rendimiento)} los pondría el rendimiento compuesto (cada peso aportado se convertiría en ≈${veces.toFixed(1)}). Traducido con el mismo factor actuarial de las demás calculadoras, serían ${fmt(rb.pensionExtra)} más de pensión mensual en pesos de hoy. En el conservador el saldo extra sería ${fmt(res.conservador.saldoExtra)}; en el optimista ${fmt(res.optimista.saldoExtra)} — el rango es la incertidumbre honesta. La cantidad es tuya y puedes moverla: la calculadora muestra su consecuencia, no te dice cuánto aportar.`;
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
            <h1>¿Qué haría por ti aportar un poco más?</h1>
            <p className="sub">Elige una <strong>aportación voluntaria adicional</strong> — la cantidad la decides tú — y mira cuánto sumaría a tu saldo y a tu pensión mensual, contra no aportarla. En <strong>pesos de hoy</strong>, tres escenarios. La calculadora muestra la consecuencia; no te dice cuánto aportar.</p>
          </div>
          <div className="hero-meta">Vigencia de supuestos: <b>2026</b><br />Base: documento actuarial v1.0 · validación actuarial 2026-07-02<br />Motor de la calculadora de ahorro, sin cambios</div>
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
              <div className="field"><label htmlFor="saldo">Saldo en tu AFORE <span className="hint">0 si no lo sabes</span></label><input type="number" id="saldo" min={0} step={1000} defaultValue={150000} /></div>
            </div>
            <div className="slider-block">
              <div className="slider-head"><label htmlFor="extra">Aportación adicional a explorar <span className="hint">mensual, sobre lo que ya haces</span></label><span className="val" id="extraVal">$500</span></div>
              <input type="range" id="extra" min={100} max={5000} step={100} defaultValue={500} aria-describedby="extraVal" />
              <div className="slider-scale"><span>$100</span><span>$2,500</span><span>$5,000</span></div>
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
                <span className="step">Paso 2 · La consecuencia</span>
                <div className="lbl" id="bigLbl">Saldo adicional al retirarte — escenario base (3.0% real)</div>
                <div className="big" id="bigExtra">$0<small> más</small></div>
                <div className="lbl" id="pensionExtraLbl" style={{ marginTop: "6px" }}></div>
              </div>
              <div className="hero-side" id="heroSide"></div>
            </div>
            <div className="card">
              <span className="step">De dónde saldría ese monto</span>
              <h3>Tu bolsillo pone una parte; el tiempo pone la otra <span className="hint">— escenario base</span></h3>
              <div className="split" id="split"></div>
              <div className="split-leg" id="splitLeg"></div>
            </div>
            <div className="card">
              <span className="step">Las dos trayectorias</span>
              <h3>Tu saldo con y sin la aportación adicional <span className="hint">— escenario base</span></h3>
              <div className="viz-wrap" id="mtWrap">
                <svg id="mtChart" viewBox="0 0 660 250" role="img" aria-label="Trayectoria del saldo con y sin aportación voluntaria adicional"></svg>
                <div className="rh-tip" id="mtTip" aria-hidden="true"></div>
              </div>
              <div className="viz-legend">
                <span style={{ color: "var(--navy)" }}><i style={{ borderColor: "var(--navy)" }}></i>sin aportación adicional</span>
                <span style={{ color: "var(--gold)" }}><i style={{ borderColor: "var(--gold)" }}></i>con aportación adicional</span>
                <span className="l-band"><i></i>lo que gana la aportación</span>
              </div>
              <details style={{ margin: "10px 0 0", border: "none", background: "none" }}><summary style={{ padding: "4px 0", fontSize: "12px" }}>Ver los datos de esta gráfica</summary><div className="det-body scroll" id="mtTable" style={{ padding: "6px 0 2px" }}></div></details>
            </div>
            <div className="card">
              <span className="step">Los tres escenarios</span>
              <h3>El mismo hábito rinde distinto según el rendimiento de largo plazo</h3>
              <div className="bars" id="bars"></div>
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
                <a href="/pensiones/calculadoras/ahorro">¿Prefieres partir de una meta de ingreso? (calculadora de ahorro)</a>
                <a href="/pensiones/calculadoras/pension">¿Cómo queda tu pensión completa? (calculadora de pensión)</a>
                <a href="#supuestos">Metodología y supuestos</a>
              </div>
            </div>
          </section>
        </div>
        <div className="lower">
          <h2 id="supuestos" style={{ fontFamily: "Merriweather,Georgia,serif", color: "var(--navy)", fontSize: "19px", margin: "0 0 4px" }}>Metodología y supuestos <span className="hint">— vigencia: 2026 · documento base actuarial v1.0</span></h2>
          <details><summary><span className="tag tR">R</span> Reglas de ley que aplica el cálculo (fuentes oficiales versionadas)</summary><div className="det-body">
            <ul>
              <li><strong>La trayectoria obligatoria usa el motor validado de la calculadora de ahorro/pensión, sin cambios:</strong> aportaciones del art. 168 LSS (patrón 2% retiro + cuota patronal CEAV gradual 2023-2030 + 1.125% del trabajador + cuota social hasta 4 UMA), decreto DOF 16-dic-2020.</li>
              <li><strong>Aportaciones voluntarias:</strong> puedes hacerlas en cualquier momento, directamente o vía tu patrón; los retiros de la subcuenta de aportaciones voluntarias tienen reglas de permanencia propias (LSS art. 192; LSAR arts. 74 y 79). Este cálculo no modela retiros anticipados.</li>
              <li><strong>Sin efectos fiscales:</strong> la deducibilidad de ciertas aportaciones (LISR) queda declarada fuera de alcance — es materia fiscal y depende de tu situación; consúltalo con quien te asesore en impuestos.</li>
            </ul></div></details>
          <details><summary><span className="tag tV">V</span> Datos oficiales vigentes usados</summary><div className="det-body">
            <ul>
              <li>UMA 2026: $117.31 diaria (INEGI, DOF 09-ene-2026) · Salario mínimo 2026: $315.04 diario (CONASAMI, DOF 09-dic-2025).</li>
              <li>Tablas EMSSAH-09/EMSSAM-09 (CNSF, DOF 14-ago-2009, Anexo 4) para traducir saldo extra a pensión mensual.</li>
              <li>Comisiones AFORE 2026: promedio 0.538% (CONSAR) — el rendimiento del supuesto S1 ya es <em>neto</em> de comisiones.</li>
            </ul></div></details>
          <details><summary><span className="tag tS">S</span> Supuestos de proyección declarados <span className="hint">— escenario ilustrativo</span></summary><div className="det-body">
            <ul>
              <li><strong>Rendimiento real neto:</strong> tres escenarios — conservador 1.5%, base 3.0%, optimista 4.5% anual. <em>Parámetros de escenario ilustrativo.</em> Todo en pesos de hoy.</li>
              <li><strong>La consecuencia se mide por diferencia:</strong> el motor corre dos veces — tu trayectoria tal como va, y la misma trayectoria más la aportación adicional — y resta. La aportación adicional es constante en pesos de hoy, con la convención del motor (aportes durante el año, capitalización anual al cierre).</li>
              <li><strong>Pensión mensual extra</strong> = saldo extra ÷ divisor de anualización EMSSA-09 (tasa técnica 2.5% real, validación actuarial 2026-07-02) — el mismo factor S7 de las demás calculadoras.</li>
              <li><strong>Crecimiento de tu salario:</strong> +1.0% real anual · <strong>Constancia:</strong> la eliges tú (presets ilustrativos 90/60/40).</li>
              <li><strong>Separación de historias:</strong> la calculadora de <em>ahorro</em> parte de una meta y deriva la aportación; ésta parte de una aportación que tú eliges y muestra su consecuencia. Mismo motor, pregunta distinta — deliberado.</li>
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
