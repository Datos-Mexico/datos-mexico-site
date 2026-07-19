"use client";

/* Calculadora de interés compuesto — cuerpo portado TAL CUAL (D8): dos
   trayectorias (empezar hoy vs esperar) con banda y tooltip, desglose split
   bolsillo/rendimiento, barras del costo por año de espera. Es la más
   sensible a S1 (rendimiento) en horizontes largos: la etiqueta de escenario
   ilustrativo va prominente. Motor en lib/pensiones/calc/calculos-c. */

import { useEffect, useRef } from "react";
import { IC_TASAS, comparaInicios, acumula, type EntradaIC } from "@/lib/pensiones/calc/calculos-c";
import "./interes-compuesto.css";

export function InteresCompuestoCalculator() {
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

    function leeInputs(): EntradaIC {
      return {
        edad: +($("edad") as HTMLInputElement).value,
        edadRetiro: +($("edadret") as HTMLInputElement).value,
        aporte: +($("aporte") as HTMLInputElement).value,
        espera: +($("espera") as HTMLInputElement).value,
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
    type R = ReturnType<typeof comparaInicios>;
    const TJ = { W: 660, H: 250, m: { t: 16, r: 74, b: 26, l: 52 } };
    function drawTrayectorias(inp: EntradaIC, r: R) {
      const svg = $("tjChart");
      const { W, H, m } = TJ;
      const iw = W - m.l - m.r, ih = H - m.t - m.b;
      const n = r.nHoy + 1;
      if (n < 2) { svg.innerHTML = ""; $("tjTable").innerHTML = ""; return; }
      const tardePorEdad: number[] = [];
      for (let t = 0; t <= r.nHoy; t++) {
        const tt = t - inp.espera;
        tardePorEdad.push(tt < 0 ? 0 : r.tarde.tray[Math.min(tt, r.nTarde)].saldo);
      }
      const maxY = Math.max(r.hoy.saldoFinal, 1) * 1.06;
      const X = (i: number) => m.l + iw * (i / (n - 1));
      const Y = (v: number) => m.t + ih * (1 - v / maxY);
      const pathHoy = r.hoy.tray.map((p, i) => (i ? "L" : "M") + X(i).toFixed(1) + "," + Y(p.saldo).toFixed(1)).join("");
      const pathTarde = tardePorEdad.map((v, i) => (i ? "L" : "M") + X(i).toFixed(1) + "," + Y(v).toFixed(1)).join("");
      const band = r.hoy.tray.map((p, i) => (i ? "L" : "M") + X(i).toFixed(1) + "," + Y(p.saldo).toFixed(1)).join("")
        + tardePorEdad.slice().reverse().map((v, i) => "L" + X(n - 1 - i).toFixed(1) + "," + Y(v).toFixed(1)).join("") + "Z";
      let grid = "", labs = "";
      for (let g = 1; g <= 3; g++) {
        const v = maxY * g / 4, y = Y(v).toFixed(1);
        grid += `<line class="gridline" x1="${m.l}" y1="${y}" x2="${W - m.r}" y2="${y}"/>`;
        labs += `<text class="axis-lbl" x="${m.l - 6}" y="${+y + 3}" text-anchor="end">${fmtK(v)}</text>`;
      }
      const stepX = Math.max(1, Math.ceil(n / 7));
      for (let i = 0; i < n; i += stepX) {
        if (i > n - 1 - stepX * 0.65) continue;
        labs += `<text class="axis-lbl" x="${X(i).toFixed(1)}" y="${H - 8}" text-anchor="middle">${inp.edad + i}</text>`;
      }
      labs += `<text class="axis-lbl" x="${X(n - 1).toFixed(1)}" y="${H - 8}" text-anchor="middle" font-weight="700">${inp.edadRetiro}</text>`;
      const endl = `<text class="endlab" x="${W - m.r + 6}" y="${(Y(r.hoy.saldoFinal) + 3.5).toFixed(1)}" fill="var(--navy)">${fmtK(r.hoy.saldoFinal)}</text>`
        + `<text class="endlab" x="${W - m.r + 6}" y="${(Y(r.tarde.saldoFinal) + (Math.abs(Y(r.tarde.saldoFinal) - Y(r.hoy.saldoFinal)) < 12 ? 16 : 3.5)).toFixed(1)}" fill="var(--gold)">${fmtK(r.tarde.saldoFinal)}</text>`;
      const iT = Math.min(inp.espera, n - 1);
      const marcaT = `<circle cx="${X(iT)}" cy="${Y(0)}" r="4.5" fill="var(--gold)" stroke="#fff" stroke-width="1.5"/>`
        + `<text class="endlab" x="${X(iT)}" y="${(Y(0) - 9).toFixed(1)}" fill="var(--gold)" text-anchor="middle">aquí empieza tu otra versión</text>`;
      svg.innerHTML = grid + labs
        + `<path d="${band}" fill="rgba(180,83,9,.13)"/>`
        + `<path d="${pathTarde}" fill="none" stroke="var(--gold)" stroke-width="2"/>`
        + `<path d="${pathHoy}" fill="none" stroke="var(--navy)" stroke-width="2.6" stroke-linecap="round"/>`
        + `<circle cx="${X(n - 1)}" cy="${Y(r.hoy.saldoFinal)}" r="4" fill="var(--navy)" stroke="#fff" stroke-width="1.5"/>`
        + `<circle cx="${X(n - 1)}" cy="${Y(r.tarde.saldoFinal)}" r="4" fill="var(--gold)" stroke="#fff" stroke-width="1.5"/>`
        + marcaT
        + `<line id="tjGuide" class="guide" y1="${m.t}" y2="${H - m.b}" x1="0" x2="0"/>`
        + endl
        + r.hoy.tray.map((p, i) => `<rect class="hitcol" x="${(X(i) - iw / (n - 1) / 2).toFixed(1)}" y="${m.t}" width="${(iw / (n - 1)).toFixed(1)}" height="${ih}" data-i="${i}"/>`).join("");
      const tip = $("tjTip"), guide = svg.querySelector<SVGLineElement>("#tjGuide")!;
      svg.querySelectorAll<SVGRectElement>(".hitcol").forEach((rect) => {
        const show = () => {
          const i = +rect.dataset.i!;
          tip.innerHTML = `<span class="rh-tip__title">A los ${inp.edad + i} años</span>`
            + `<div class="rh-tip__detail">${fmt(r.hoy.tray[i].saldo)} <span class="dim">empezando hoy</span></div>`
            + `<div class="rh-tip__detail">${fmt(tardePorEdad[i])} <span class="dim">empezando después</span></div>`
            + `<div class="rh-tip__detail">${fmt(r.hoy.tray[i].saldo - tardePorEdad[i])} <span class="dim">brecha</span></div>`;
          const wrap = $("tjWrap"), sw = wrap.clientWidth / W;
          tip.style.left = X(i) * sw + "px"; tip.style.top = Y(r.hoy.tray[i].saldo) * wrap.clientHeight / H + "px";
          tip.classList.add("is-visible");
          guide.setAttribute("x1", String(X(i))); guide.setAttribute("x2", String(X(i))); guide.classList.add("on");
        };
        const hide = () => { tip.classList.remove("is-visible"); guide.classList.remove("on"); };
        rect.addEventListener("mouseenter", show); rect.addEventListener("mouseleave", hide);
        rect.addEventListener("touchstart", (e) => { e.preventDefault(); show(); }, { passive: false });
      });
      $("tjTable").innerHTML = '<table><thead><tr><th>Edad</th><th>Empezando hoy</th><th>Empezando después</th><th>Brecha</th></tr></thead><tbody>'
        + r.hoy.tray.map((p, i) => `<tr><td>${inp.edad + i}</td><td>${fmt(p.saldo)}</td><td>${fmt(tardePorEdad[i])}</td><td>${fmt(p.saldo - tardePorEdad[i])}</td></tr>`).join("")
        + "</tbody></table>";
    }
    let prevBig = 0;
    function render() {
      const inp = leeInputs();
      $("aporteVal").textContent = fmt(inp.aporte);
      $("esperaVal").textContent = inp.espera + (inp.espera === 1 ? " año" : " años");
      ([["aporte", 100, 10000], ["espera", 1, 20]] as const).forEach(([id, min, max]) => {
        const el = $(id) as HTMLInputElement; el.style.setProperty("--pct", 100 * (+el.value - min) / (max - min) + "%");
      });
      if (!(inp.edad >= 18 && inp.edad < inp.edadRetiro)) { $("bigCosto").innerHTML = "—<small> revisa tus edades</small>"; return; }
      const res = Object.fromEntries(ESC.map((e) => [e.k, comparaInicios(inp, IC_TASAS[e.k])])) as Record<string, R>;
      const rb = res.base;
      const esperaEfectiva = rb.nHoy - rb.nTarde;
      const target = rb.costo;
      tween(prevBig, target, 420, (k) => { $("bigCosto").innerHTML = fmt(lerp(prevBig, target, k)) + "<small> menos al retirarte</small>"; });
      prevBig = target;
      $("bigLbl").textContent = `Lo que te costaría esperar ${esperaEfectiva} ${esperaEfectiva === 1 ? "año" : "años"} — escenario base (3.0% real)`;
      const difBolsillo = rb.aportadoHoy - rb.aportadoTarde;
      $("bolsilloLbl").innerHTML = `De ese monto, solo <strong style="color:#fff">${fmt(difBolsillo)}</strong> son aportes que no hiciste — el resto es rendimiento que el tiempo ya no genera`;
      $("heroSide").innerHTML =
        `<div class="row"><span>Empezando hoy (${rb.nHoy} años)</span><b>${fmt(rb.hoy.saldoFinal)}</b></div>`
        + `<div class="row"><span>Empezando a los ${inp.edad + esperaEfectiva} (${rb.nTarde} años)</span><b>${fmt(rb.tarde.saldoFinal)}</b></div>`
        + `<div class="row"><span>Tu bolsillo pondría (hoy / después)</span><b>${fmtK(rb.aportadoHoy)} / ${fmtK(rb.aportadoTarde)}</b></div>`
        + `<div class="row" style="border:none"><span>Aporte mensual</span><b>${fmt(inp.aporte)}</b></div>`;
      drawTrayectorias(inp, rb);
      const rendHoy = rb.hoy.saldoFinal - rb.aportadoHoy;
      const rendTarde = rb.tarde.saldoFinal - rb.aportadoTarde;
      const base = Math.max(rb.hoy.saldoFinal, 1);
      $("srHoy").textContent = fmt(rb.hoy.saldoFinal);
      $("srTardeLbl").textContent = `Empezando a los ${inp.edad + esperaEfectiva}`;
      $("srTarde").textContent = fmt(rb.tarde.saldoFinal);
      $("splitHoy").innerHTML =
        `<div class="seg" style="width:${(100 * rb.aportadoHoy / base).toFixed(1)}%;background:var(--navy)"></div>`
        + `<div class="seg" style="width:${(100 * rendHoy / base).toFixed(1)}%;background:var(--gold)"></div>`;
      $("splitTarde").innerHTML =
        `<div class="seg" style="width:${(100 * rb.aportadoTarde / base).toFixed(1)}%;background:var(--navy)"></div>`
        + `<div class="seg" style="width:${(100 * rendTarde / base).toFixed(1)}%;background:var(--gold)"></div>`;
      $("splitLeg").innerHTML =
        `<span><i style="background:var(--navy)"></i>Tu bolsillo</span>`
        + `<span><i style="background:var(--gold)"></i>Rendimiento compuesto (el trabajo del tiempo)</span>`;
      const pctRendHoy = rb.hoy.saldoFinal > 0 ? Math.round(100 * rendHoy / rb.hoy.saldoFinal) : 0;
      const pctRendTarde = rb.tarde.saldoFinal > 0 ? Math.round(100 * rendTarde / rb.tarde.saldoFinal) : 0;
      $("mecanica").textContent = `Empezando hoy, el ${pctRendHoy}% de tu saldo final lo pondría el rendimiento; empezando después, solo el ${pctRendTarde}%. Esa es la mecánica completa: el interés compuesto necesita años para que el rendimiento gane su propio rendimiento — y los años que más producen son justamente los primeros que aportas, porque son los que más tiempo trabajan.`;
      const pasos: { e: number; c: number; marginal: number }[] = [];
      for (let e = 1; e <= Math.min(inp.espera, rb.nHoy); e++) {
        const nT = rb.nHoy - e;
        const c = rb.hoy.saldoFinal - acumula(inp.aporte, nT, IC_TASAS.base).saldoFinal;
        pasos.push({ e, c, marginal: c - (pasos.length ? pasos[pasos.length - 1].c : 0) });
      }
      const maxC = Math.max(...pasos.map((p) => p.c), 1);
      $("anios").innerHTML = pasos.map((p) =>
        `<div class="bar-row" tabindex="0" aria-label="Esperar ${p.e} años costaría ${fmt(p.c)}">
          <div class="b-lbl">${p.e} ${p.e === 1 ? "año" : "años"}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${(100 * p.c / maxC).toFixed(1)}%;background:${p.e === pasos.length ? "var(--gold)" : "var(--navy)"}"></div></div>
          <div class="bar-val">${fmtK(p.c)}</div>
        </div>`).join("");
      const maxV = Math.max(...ESC.map((e) => res[e.k].costo), 1) * 1.12;
      $("bars").innerHTML = ESC.map((e) => {
        const r = res[e.k], w = 100 * r.costo / maxV;
        return `<div class="bar-row" tabindex="0" aria-label="${e.lbl} ${e.tasa}: esperar costaría ${fmt(r.costo)}">
          <div class="b-lbl">${e.lbl}<span class="hint">${e.tasa} real</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${w.toFixed(1)}%;background:${e.color}"></div></div>
          <div class="bar-val">${fmt(r.costo)}</div>
        </div>`;
      }).join("");
      const primero = pasos.length ? pasos[0].c : rb.costo;
      const ultimoMarginal = pasos.length > 1 ? pasos[pasos.length - 1].marginal : rb.costo;
      $("interp").textContent = `Con ${fmt(inp.aporte)} al mes desde hoy llegarías a ${fmt(rb.hoy.saldoFinal)} a los ${inp.edadRetiro} (escenario base, pesos de hoy); esperando ${esperaEfectiva} ${esperaEfectiva === 1 ? "año" : "años"}, a ${fmt(rb.tarde.saldoFinal)}. La diferencia — ${fmt(rb.costo)} — esconde la lección fina del interés compuesto: el año más caro de perder es justo el primero (cuesta ${fmt(primero)}, porque renuncia al aporte que más tiempo habría trabajado); cada año adicional de espera añade un poco menos (${fmt(ultimoMarginal)} el último de los tuyos) — y aun así el total sigue creciendo. Por eso "empiezo el año que viene" es la frase más cara del ahorro. En el escenario conservador tu espera costaría ${fmt(res.conservador.costo)}; en el optimista ${fmt(res.optimista.costo)}. Nada de esto es una promesa de rendimiento ni te dice cuánto ahorrar: es la mecánica del tiempo, mostrada con tus números.`;
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
            <h1>¿Cuánto cuesta esperar para empezar a ahorrar?</h1>
            <p className="sub">El interés compuesto trabaja para quien le da <strong>tiempo</strong>. Compara dos versiones de ti: la que empieza hoy y la que empieza dentro de unos años, con el mismo aporte mensual. En <strong>pesos de hoy</strong>, tres escenarios. Esto enseña una mecánica — no promete rendimientos.</p>
          </div>
          <div className="hero-meta">Vigencia de supuestos: <b>2026</b><br />Base: documento actuarial v1.0 · escenarios ilustrativos<br />Ahorro voluntario genérico, sin promesa</div>
        </header>
        <div className="calc-grid">
          <aside className="panel" id="f">
            <span className="step">Paso 1 · Las dos versiones de ti</span>
            <h2>Tus datos</h2>
            <div className="fgrid">
              <div className="field"><label htmlFor="edad">Edad actual</label><input type="number" id="edad" min={18} max={60} defaultValue={25} /></div>
              <div className="field"><label htmlFor="edadret">Edad de retiro</label><input type="number" id="edadret" min={60} max={70} defaultValue={65} /></div>
            </div>
            <div className="slider-block">
              <div className="slider-head"><label htmlFor="aporte">Aporte mensual <span className="hint">constante, en pesos de hoy</span></label><span className="val" id="aporteVal">$1,000</span></div>
              <input type="range" id="aporte" min={100} max={10000} step={100} defaultValue={1000} aria-describedby="aporteVal" />
              <div className="slider-scale"><span>$100</span><span>$5,000</span><span>$10,000</span></div>
            </div>
            <div className="slider-block">
              <div className="slider-head"><label htmlFor="espera">¿Y si esperaras…? <span className="hint">años antes de empezar</span></label><span className="val" id="esperaVal">10 años</span></div>
              <input type="range" id="espera" min={1} max={20} step={1} defaultValue={10} aria-describedby="esperaVal" />
              <div className="slider-scale"><span>1</span><span>10</span><span>20</span></div>
            </div>
            <div className="slider-block" style={{ borderTop: "1px solid var(--line)" }}>
              <p className="hint" style={{ marginTop: "12px" }}>El resultado depende fuertemente del <strong>rendimiento real</strong>, un <strong>parámetro de escenario ilustrativo</strong> (1.5 / 3.0 / 4.5%), no un pronóstico. En horizontes largos es el supuesto más determinante.</p>
            </div>
          </aside>
          <section className="results">
            <div className="card hero-res">
              <div>
                <span className="step">Paso 2 · El costo de esperar</span>
                <div className="lbl" id="bigLbl">Saldo que pierdes por esperar — escenario base (3.0% real)</div>
                <div className="big" id="bigCosto">$0<small> menos</small></div>
                <div className="lbl" id="bolsilloLbl" style={{ marginTop: "6px" }}></div>
              </div>
              <div className="hero-side" id="heroSide"></div>
            </div>
            <div className="card">
              <span className="step">Las dos trayectorias</span>
              <h3>Mismo aporte, distinto punto de partida <span className="hint">— escenario base</span></h3>
              <div className="viz-wrap" id="tjWrap">
                <svg id="tjChart" viewBox="0 0 660 250" role="img" aria-label="Trayectoria del saldo empezando hoy frente a empezar años después"></svg>
                <div className="rh-tip" id="tjTip" aria-hidden="true"></div>
              </div>
              <div className="viz-legend">
                <span style={{ color: "var(--navy)" }}><i style={{ borderColor: "var(--navy)" }}></i>empiezas hoy</span>
                <span style={{ color: "var(--gold)" }}><i style={{ borderColor: "var(--gold)" }}></i>empiezas después</span>
                <span className="l-band"><i></i>la brecha que abre el tiempo</span>
              </div>
              <details style={{ margin: "10px 0 0", border: "none", background: "none" }}><summary style={{ padding: "4px 0", fontSize: "12px" }}>Ver los datos de esta gráfica</summary><div className="det-body scroll" id="tjTable" style={{ padding: "6px 0 2px" }}></div></details>
            </div>
            <div className="card">
              <span className="step">La mecánica al desnudo</span>
              <h3>De cada saldo final, cuánto puso tu bolsillo — y cuánto puso el tiempo</h3>
              <div className="split-row">
                <div className="sr-lbl"><span>Empezando hoy</span><span id="srHoy">—</span></div>
                <div className="split" id="splitHoy"></div>
              </div>
              <div className="split-row">
                <div className="sr-lbl"><span id="srTardeLbl">Empezando después</span><span id="srTarde">—</span></div>
                <div className="split" id="splitTarde"></div>
              </div>
              <div className="split-leg" id="splitLeg"></div>
              <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", margin: "10px 0 0" }} id="mecanica"></p>
            </div>
            <div className="card">
              <span className="step">El primer año es el más caro</span>
              <h3>El costo de esperar 1, 2, 3… años <span className="hint">— escenario base; el total crece, pero el año que más pierde es el primero</span></h3>
              <div className="bars mini" id="anios"></div>
            </div>
            <div className="card">
              <span className="step">Los tres escenarios</span>
              <h3>El costo de tu espera según el rendimiento de largo plazo</h3>
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
                <a href="/pensiones/calculadoras/aportaciones">Llévalo a tu AFORE real (aportaciones voluntarias)</a>
                <a href="/pensiones/calculadoras/ahorro">¿Qué aportación pide una meta concreta? (calculadora de ahorro)</a>
                <a href="#supuestos">Metodología y supuestos</a>
              </div>
            </div>
          </section>
        </div>
        <div className="lower">
          <h2 id="supuestos" style={{ fontFamily: "Merriweather,Georgia,serif", color: "var(--navy)", fontSize: "19px", margin: "0 0 4px" }}>Metodología y supuestos <span className="hint">— vigencia: 2026 · documento base actuarial v1.0</span></h2>
          <details><summary><span className="tag tS">S</span> Supuestos de proyección declarados <span className="hint">— escenario ilustrativo (dominante en horizontes largos)</span></summary><div className="det-body">
            <ul>
              <li><strong>Rendimiento real neto:</strong> tres escenarios — conservador 1.5%, base 3.0%, optimista 4.5% anual (el mismo juego S1 de todas las calculadoras del sitio). <strong>Parámetros de escenario ilustrativo, no un pronóstico</strong>; en horizontes largos es el supuesto más determinante del resultado. Todo en pesos de hoy; nada aquí es una promesa de rendimiento.</li>
              <li><strong>Convención de acumulación:</strong> la misma del motor validado de las calculadoras de ahorro y aportaciones — aportes durante el año, capitalización anual al cierre. Su forma cerrada <code>12·(1+r)·((1+r)^n−1)/r</code> está verificada por casos de prueba independientes.</li>
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
