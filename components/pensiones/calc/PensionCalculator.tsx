"use client";

/* Calculadora de pensión estimada — cuerpo portado TAL CUAL (D8) de
   la calculadora de pensión original: mismo layout, controles, gráfica SVG fan-chart,
   rAF count-up, tooltip .rh-tip, semáforo, Ley 73 y bloque PMG. El motor
   (funciones puras) vive en lib/pensiones/calc/engine.ts (paridad al centavo
   verificada). La capa de presentación se ejecuta verbatim en un useEffect
   scopeado al contenedor; sólo se cambian tokens de color, hrefs y branding. */

import { useEffect, useRef } from "react";
import {
  P,
  proyectaLey97,
  calculaLey73,
  pmgAplicable,
  type EntradaLey97,
} from "@/lib/pensiones/calc/engine";
import "./calc-base.css";

export function PensionCalculator() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const $ = (id: string) => root.querySelector<HTMLElement>("#" + id)!;
    const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fmt = (n: number) => "$" + Math.round(n).toLocaleString("es-MX");
    const fmtK = (n: number) =>
      n >= 1e6 ? "$" + (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + " M" : "$" + Math.round(n / 1000) + " mil";
    const ESC = [
      { k: "conservador", lbl: "Conservador", tasa: "1.5%", color: "var(--text-secondary)" },
      { k: "base", lbl: "Base", tasa: "3.0%", color: "var(--navy)" },
      { k: "optimista", lbl: "Optimista", tasa: "4.5%", color: "var(--gold)" },
    ] as const;

    function leeInputs(): EntradaLey97 {
      return {
        edad: +($("edad") as HTMLInputElement).value,
        sexo: ($("sexo") as unknown as HTMLSelectElement).value as "H" | "M",
        salario: +($("salario") as HTMLInputElement).value,
        saldo: +($("saldo") as HTMLInputElement).value,
        semanas: +($("semanas") as HTMLInputElement).value,
        pre97: root!.querySelector<HTMLInputElement>("input[name=pre97]:checked")!.value === "si",
        edadRetiro: +($("edadret") as HTMLInputElement).value,
        densidad: +($("densidad") as HTMLInputElement).value / 100,
        voluntaria: +($("voluntaria") as HTMLInputElement).value,
      };
    }
    function semaforo(pct: number): [string, string] {
      if (pct >= 70) return ["ok", "Encaminado"];
      if (pct >= 40) return ["mid", "A media construcción"];
      return ["low", "Por reforzar"];
    }
    function trayectoria(inp: EntradaLey97, tasa: number) {
      const out = [{ edad: inp.edad, saldo: inp.saldo }];
      for (let e = inp.edad + 1; e <= inp.edadRetiro; e++)
        out.push({ edad: e, saldo: proyectaLey97({ ...inp, edadRetiro: e }, tasa).saldoFinal });
      return out;
    }

    let animState: number | null = null;
    function tween(from: number, to: number, ms: number, onStep: (k: number, to: number) => void) {
      if (REDUCED || ms <= 0) { onStep(1, to); return; }
      if (animState) cancelAnimationFrame(animState);
      const t0 = performance.now();
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);
      function step(now: number) {
        const t = Math.min(1, (now - t0) / ms), k = ease(t);
        onStep(k, to);
        if (t < 1) animState = requestAnimationFrame(step);
      }
      animState = requestAnimationFrame(step);
    }
    const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

    type Serie = { edad: number; saldo: number }[];
    const FAN = { W: 660, H: 250, m: { t: 16, r: 74, b: 26, l: 52 } };
    function drawFan(series: { conservador: Serie; base: Serie; optimista: Serie }) {
      const svg = $("fanChart");
      const { W, H, m } = FAN;
      const iw = W - m.l - m.r, ih = H - m.t - m.b;
      const n = series.base.length;
      const maxY = Math.max(series.optimista[n - 1].saldo, 1) * 1.06;
      const X = (i: number) => m.l + iw * (n === 1 ? 0 : i / (n - 1));
      const Y = (v: number) => m.t + ih * (1 - v / maxY);
      const path = (arr: Serie) => arr.map((p, i) => (i ? "L" : "M") + X(i).toFixed(1) + "," + Y(p.saldo).toFixed(1)).join("");
      const band = series.optimista.map((p, i) => (i ? "L" : "M") + X(i).toFixed(1) + "," + Y(p.saldo).toFixed(1)).join("")
        + series.conservador.slice().reverse().map((p, i) => "L" + X(n - 1 - i).toFixed(1) + "," + Y(p.saldo).toFixed(1)).join("") + "Z";
      let grid = "", labs = "";
      for (let g = 1; g <= 3; g++) {
        const v = maxY * g / 4, y = Y(v).toFixed(1);
        grid += `<line class="gridline" x1="${m.l}" y1="${y}" x2="${W - m.r}" y2="${y}"/>`;
        labs += `<text class="axis-lbl" x="${m.l - 6}" y="${+y + 3}" text-anchor="end">${fmtK(v)}</text>`;
      }
      const stepX = Math.max(1, Math.ceil(n / 7));
      for (let i = 0; i < n; i += stepX) {
        if (i > n - 1 - stepX * 0.65) continue;
        labs += `<text class="axis-lbl" x="${X(i).toFixed(1)}" y="${H - 8}" text-anchor="middle">${series.base[i].edad}</text>`;
      }
      labs += `<text class="axis-lbl" x="${X(n - 1).toFixed(1)}" y="${H - 8}" text-anchor="middle" font-weight="700">${series.base[n - 1].edad}</text>`;
      const endl = ESC.map((e) => {
        const v = series[e.k][n - 1].saldo;
        return `<text class="endlab" x="${W - m.r + 6}" y="${(Y(v) + 3.5).toFixed(1)}" fill="${e.color}">${fmtK(v)}</text>`;
      }).join("");
      svg.innerHTML = grid + labs
        + `<path d="${band}" fill="rgba(180,83,9,.13)"/>`
        + `<path d="${path(series.conservador)}" fill="none" stroke="var(--text-secondary)" stroke-width="1.6" stroke-dasharray="4 4"/>`
        + `<path d="${path(series.optimista)}" fill="none" stroke="var(--gold)" stroke-width="2"/>`
        + `<path d="${path(series.base)}" fill="none" stroke="var(--navy)" stroke-width="2.6" stroke-linecap="round"/>`
        + `<circle class="dotm" cx="${X(n - 1)}" cy="${Y(series.base[n - 1].saldo)}" r="4" fill="var(--navy)" stroke="#fff" stroke-width="1.5"/>`
        + `<line id="fanGuide" class="guide" y1="${m.t}" y2="${H - m.b}" x1="0" x2="0"/>`
        + endl
        + series.base.map((p, i) =>
          `<rect class="hitcol" x="${(X(i) - iw / (n - 1) / 2).toFixed(1)}" y="${m.t}" width="${(iw / (n - 1)).toFixed(1)}" height="${ih}" data-i="${i}"/>`).join("");
      const tip = $("fanTip"), guide = svg.querySelector<SVGLineElement>("#fanGuide")!;
      svg.querySelectorAll<SVGRectElement>(".hitcol").forEach((r) => {
        const show = () => {
          const i = +r.dataset.i!, p = series.base[i];
          tip.innerHTML = `<span class="rh-tip__title">A los ${p.edad} años</span>`
            + `<div class="rh-tip__detail">${fmt(p.saldo)} <span class="dim">base</span></div>`
            + `<div class="rh-tip__detail"><span class="dim">${fmt(series.conservador[i].saldo)} - ${fmt(series.optimista[i].saldo)}</span></div>`;
          const wrap = $("fanWrap"), sw = wrap.clientWidth / W;
          tip.style.left = X(i) * sw + "px"; tip.style.top = Y(p.saldo) * wrap.clientHeight / H + "px";
          tip.classList.add("is-visible");
          guide.setAttribute("x1", String(X(i))); guide.setAttribute("x2", String(X(i))); guide.classList.add("on");
        };
        const hide = () => { tip.classList.remove("is-visible"); guide.classList.remove("on"); };
        r.addEventListener("mouseenter", show); r.addEventListener("mouseleave", hide);
        r.addEventListener("touchstart", (e) => { e.preventDefault(); show(); }, { passive: false });
      });
      $("fanTable").innerHTML = '<table><thead><tr><th>Edad</th><th>Conservador</th><th>Base</th><th>Optimista</th></tr></thead><tbody>'
        + series.base.map((p, i) => `<tr><td>${p.edad}</td><td>${fmt(series.conservador[i].saldo)}</td><td>${fmt(p.saldo)}</td><td>${fmt(series.optimista[i].saldo)}</td></tr>`).join("")
        + "</tbody></table>";
    }

    let prevBig = 0;
    function render() {
      const inp = leeInputs();
      $("edadretVal").textContent = inp.edadRetiro + " años";
      $("densidadVal").textContent = Math.round(inp.densidad * 100) + "%";
      $("voluntariaVal").textContent = fmt(inp.voluntaria);
      ([["edadret", 60, 70], ["densidad", 10, 100], ["voluntaria", 0, 5000]] as const).forEach(([id, min, max]) => {
        const el = $(id) as HTMLInputElement; el.style.setProperty("--pct", 100 * (+el.value - min) / (max - min) + "%");
      });
      if (!(inp.edad >= 18 && inp.edad < inp.edadRetiro)) {
        $("bigPension").innerHTML = "—<small> revisa tu edad</small>"; return;
      }
      const res = Object.fromEntries(ESC.map((e) => [e.k, proyectaLey97(inp, P.TASAS[e.k])])) as Record<string, ReturnType<typeof proyectaLey97>>;
      const rb = res.base;
      const target = rb.pension;
      tween(prevBig, target, 420, (k) => {
        $("bigPension").innerHTML = fmt(lerp(prevBig, target, k)) + "<small> /mes</small>";
      });
      prevBig = target;
      const repl = 100 * rb.pension / inp.salario;
      const [cls, txt] = semaforo(repl);
      const sem = $("semaforo"); sem.className = "sem " + cls; sem.textContent = txt;
      $("heroSide").innerHTML =
        `<div class="row"><span>De tu salario actual</span><b>≈ ${repl.toFixed(0)}%</b></div>`
        + `<div class="row"><span>Saldo proyectado (base)</span><b>${fmt(rb.saldoFinal)}</b></div>`
        + `<div class="row"><span>Semanas al retirarte</span><b>${rb.semanasFinales} / ${rb.reqSemanas} requeridas</b></div>`
        + `<div class="row" style="border:none"><span>Te retirarías en</span><b>${rb.anioRetiro}, a los ${inp.edadRetiro}</b></div>`;
      $("eligWarn").innerHTML = rb.elegible ? "" :
        `<div class="note alert"><strong>Con estos datos no alcanzarías el requisito de semanas.</strong> Al retirarte en ${rb.anioRetiro} la ley pide <strong>${rb.reqSemanas} semanas</strong> y tu proyección llega a <strong>${rb.semanasFinales}</strong>. Sin ese requisito no hay pensión de cesantía/vejez a esa fecha: las cifras muestran <em>el ingreso mensual que tu saldo podría sostener</em> si lo cumplieras. Mueve la constancia de cotización o la edad de retiro para ver cómo cambia.</div>`;
      drawFan({
        conservador: trayectoria(inp, P.TASAS.conservador),
        base: trayectoria(inp, P.TASAS.base),
        optimista: trayectoria(inp, P.TASAS.optimista),
      });
      const maxV = Math.max(res.optimista.pension, inp.salario) * 1.12;
      $("bars").innerHTML = ESC.map((e) => {
        const r = res[e.k], w = 100 * r.pension / maxV;
        return `<div class="bar-row" tabindex="0" aria-label="${e.lbl} ${e.tasa}: ${fmt(r.pension)} al mes">
          <div class="b-lbl">${e.lbl}<span class="hint">${e.tasa} real</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${w.toFixed(1)}%;background:${e.color}"></div>
            <div class="refline" style="left:${(100 * inp.salario / maxV).toFixed(1)}%">${e.k === "conservador" ? `<span class="reflab">Tu salario hoy · ${fmt(inp.salario)}</span>` : ""}</div>
          </div>
          <div class="bar-val">${fmt(r.pension)}</div>
        </div>`;
      }).join("");
      const pmg = pmgAplicable(inp.edadRetiro, rb.semanasFinales, inp.salario, rb.anioRetiro);
      let pmgHTML = "";
      if (pmg.aplica && rb.pension < pmg.mensual) {
        pmgHTML = `<div class="note">Para tu caso (retiro a los ${inp.edadRetiro} con ${rb.semanasFinales.toLocaleString("es-MX")} semanas, tu salario como aproximación del promedio de tu vida laboral), la <strong>pensión garantizada</strong> es de <strong>${fmt(pmg.mensual)} al mes</strong> en pesos de hoy (LSS art. 170: matriz oficial del decreto DOF 16-dic-2020, actualizada por INPC). Tu proyección base (${fmt(rb.pension)}) queda por debajo: cumpliendo edad y semanas, el Estado cubre la diferencia hasta ese mínimo — tu saldo paga primero y, si se agota, el Gobierno Federal continúa el pago (art. 172).</div>`;
      } else if (pmg.aplica && rb.pension < pmg.mensual * 1.15) {
        pmgHTML = `<div class="note">Tu proyección base (${fmt(rb.pension)}) queda apenas arriba de la <strong>pensión garantizada</strong> de tu caso: <strong>${fmt(pmg.mensual)} al mes</strong> en pesos de hoy (LSS art. 170, matriz oficial actualizada por INPC). Ese es el piso que el Estado asegura cumpliendo edad y semanas.</div>`;
      }
      $("pmgNote").innerHTML = pmgHTML;
      if (inp.pre97) {
        const l73 = calculaLey73(inp);
        $("ley73Box").innerHTML = l73.elegible ? `<div class="card ley73">
          <span class="step">Generación de transición</span>
          <h3>También tienes derecho al cálculo de la Ley 73</h3>
          <div class="big73">${fmt(l73.pension)} <span class="hint">/mes (fórmula Ley 73)</span></div>
          <p>Fórmula del art. 167 con tu salario actual como aproximación del promedio de tus últimas 250 semanas: cuantía básica ${l73.cuantia}% + ${l73.nIncrementos} incrementos de ${l73.incremento}% · factor por edad ${Math.round(l73.factorEdad * 100)}% · asignación +15% · piso 1 salario mínimo · techo 100% del salario promedio. Al pensionarte, la ley te deja <strong>elegir el esquema que te resulte mayor</strong> (transitorio Tercero, LSS 1997) y el IMSS está obligado a calcularte ambos (transitorio Cuarto).</p>
        </div>` : `<div class="note">Marcaste cotización previa a 1997, pero la proyección no alcanza las <strong>500 semanas</strong> que la Ley 73 exige (llegas a ${l73.semanas}).</div>`;
      } else { $("ley73Box").innerHTML = ""; }
      const gapTxt = repl >= 70 ? "tu proyección base sostiene la mayor parte de tu nivel de vida actual"
        : (repl >= 40 ? "tu proyección base cubre una parte de tu nivel de vida actual, con una brecha visible"
          : "tu proyección base deja una brecha grande frente a tu nivel de vida actual");
      const volTxt = inp.voluntaria > 0
        ? ` La aportación voluntaria de ${fmt(inp.voluntaria)} al mes ya está incluida — puedes moverla a cero para ver su efecto.`
        : " La barra de aportación voluntaria te muestra la consecuencia de ahorrar por tu cuenta — es el control con más efecto directo de esta pantalla.";
      $("interp").textContent = `En el escenario base (3.0% real), con tus datos actuales tu pensión estimada sería de ${fmt(rb.pension)} al mes en pesos de hoy — es decir, ${gapTxt} (≈${repl.toFixed(0)}% de tu salario). La banda de la gráfica muestra el rango razonable según cómo les vaya a los rendimientos de largo plazo; ninguna línea es una promesa.${volTxt} Cada control es una decisión o circunstancia tuya: la calculadora muestra sus consecuencias, no te dice qué hacer.`;
    }
    const onInput = (el: HTMLElement) => {
      render();
      if ((el as HTMLInputElement).type === "range") {
        const v = root!.querySelector<HTMLElement>("#" + el.id + "Val");
        if (v) { v.classList.add("bump"); clearTimeout((v as unknown as { _t: number })._t); (v as unknown as { _t: number })._t = window.setTimeout(() => v.classList.remove("bump"), 350); }
      }
    };
    const handlers: Array<[Element, () => void]> = [];
    root.querySelectorAll<HTMLElement>("#f input, #f select").forEach((el) => {
      const h = () => onInput(el);
      el.addEventListener("input", h);
      handlers.push([el, h]);
    });
    const onResize = () => render();
    addEventListener("resize", onResize);
    render();
    return () => {
      handlers.forEach(([el, h]) => el.removeEventListener("input", h));
      removeEventListener("resize", onResize);
      if (animState) cancelAnimationFrame(animState);
    };
  }, []);

  return (
    <div className="calc-root" ref={rootRef}>
      <link rel="stylesheet" href="/pensiones/sar-29/vendor/fonts.css" precedence="default" />
      <div className="wrap">
        <header className="top">
          <div>
            <div className="kicker">Datos México · Calculadoras</div>
            <h1>¿Con cuánto podrías retirarte?</h1>
            <p className="sub">Proyección educativa de tu pensión IMSS bajo tres escenarios, en <strong>pesos de hoy</strong>. Metodología validada actuarialmente; supuestos públicos abajo. Esto informa — las decisiones son tuyas.</p>
          </div>
          <div className="hero-meta">Vigencia de supuestos: <b>2026</b><br />Base: documento actuarial v1.0 · validación actuarial 2026-07-02<br />Tablas EMSSA-09 · tasa técnica 2.5% real</div>
        </header>

        <div className="calc-grid">
          <aside className="panel" id="f">
            <span className="step">Paso 1 · Cuéntanos dónde estás</span>
            <h2>Tus datos</h2>
            <div className="fgrid">
              <div className="field"><label htmlFor="edad">Edad actual</label><input type="number" id="edad" min={18} max={69} defaultValue={40} /></div>
              <div className="field"><label htmlFor="sexo">Sexo <span className="hint">(EMSSA-09 difiere por sexo)</span></label>
                <select id="sexo" defaultValue="H"><option value="H">Hombre</option><option value="M">Mujer</option></select></div>
              <div className="field"><label htmlFor="salario">Salario mensual bruto <span className="hint">aprox. tu SBC</span></label><input type="number" id="salario" min={0} step={500} defaultValue={15000} /></div>
              <div className="field"><label htmlFor="saldo">Saldo en tu AFORE <span className="hint">0 si no lo sabes</span></label><input type="number" id="saldo" min={0} step={1000} defaultValue={150000} /></div>
              <div className="field"><label htmlFor="semanas">Semanas cotizadas</label><input type="number" id="semanas" min={0} max={3000} defaultValue={800} /></div>
              <div className="field"><label>¿Cotizaste antes de jul-1997?</label>
                <div className="radio-row" role="radiogroup">
                  <label><input type="radio" name="pre97" value="no" defaultChecked /> No</label>
                  <label><input type="radio" name="pre97" value="si" /> Sí</label>
                </div></div>
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
            <div className="slider-block">
              <div className="slider-head"><label htmlFor="voluntaria">Aportación voluntaria mensual <span className="hint">la consecuencia de ahorrar por tu cuenta</span></label><span className="val" id="voluntariaVal">$0</span></div>
              <input type="range" id="voluntaria" min={0} max={5000} step={100} defaultValue={0} aria-describedby="voluntariaVal" />
              <div className="slider-scale"><span>$0</span><span>$2,500</span><span>$5,000</span></div>
            </div>
          </aside>

          <section className="results">
            <div className="card hero-res">
              <div>
                <span className="step">Paso 2 · Tu proyección</span>
                <div className="lbl">Pensión mensual estimada — escenario base (3.0% real), en pesos de hoy</div>
                <div className="big" id="bigPension">$0<small> /mes</small></div>
                <span className="sem mid" id="semaforo">—</span>
              </div>
              <div className="hero-side" id="heroSide"></div>
            </div>
            <div id="eligWarn"></div>
            <div className="card">
              <span className="step">La historia de tu saldo</span>
              <h3>Así crecería tu ahorro hasta el retiro <span className="hint">— y así se abre el abanico de escenarios</span></h3>
              <div className="viz-wrap" id="fanWrap">
                <svg id="fanChart" viewBox="0 0 660 250" role="img" aria-label="Evolución proyectada del saldo por edad en tres escenarios"></svg>
                <div className="rh-tip" id="fanTip" aria-hidden="true"></div>
              </div>
              <div className="viz-legend">
                <span className="l-band"><i></i>rango conservador–optimista</span>
                <span style={{ color: "var(--navy)" }}><i style={{ borderColor: "var(--navy)" }}></i>base 3.0%</span>
                <span><i style={{ borderColor: "var(--gold)" }}></i>optimista 4.5%</span>
                <span><i style={{ borderColor: "var(--text-secondary)", borderTopStyle: "dashed" }}></i>conservador 1.5%</span>
              </div>
              <details style={{ margin: "10px 0 0", border: "none", background: "none" }}><summary style={{ padding: "4px 0", fontSize: "12px" }}>Ver los datos de esta gráfica</summary><div className="det-body scroll" id="fanTable" style={{ padding: "6px 0 2px" }}></div></details>
            </div>
            <div className="card">
              <span className="step">Los tres escenarios</span>
              <h3>Tu pensión mensual frente a tu salario de hoy</h3>
              <div className="bars" id="bars"></div>
            </div>
            <div id="pmgNote"></div>
            <div id="ley73Box"></div>
            <div className="card">
              <span className="step">Paso 3 · Qué significa</span>
              <h3>Lectura de tu resultado</h3>
              <p className="interp" id="interp"></p>
            </div>
            <div className="card">
              <span className="step">Paso 4 · Siguiente paso</span>
              <h3>Para seguir entendiendo</h3>
              <div className="next">
                <a href="/pensiones/calculadoras/comparador">Comparar edades de retiro (calculadora de comparador)</a>
                <a href="/pensiones/sar-29">La serie “El SAR en 29 años”</a>
                <a href="#supuestos">Metodología y supuestos</a>
              </div>
            </div>
          </section>
        </div>

        <div className="lower">
          <h2 id="supuestos" style={{ fontFamily: "Merriweather,Georgia,serif", color: "var(--navy)", fontSize: "19px", margin: "0 0 4px" }}>Metodología y supuestos <span className="hint">— vigencia: 2026 · documento base actuarial v1.0 (validación actuarial: 2026-07-02)</span></h2>
          <details><summary><span className="tag tR">R</span> Reglas de ley que aplica el cálculo (fuentes oficiales versionadas)</summary><div className="det-body">
            <ul>
              <li><strong>Requisitos Ley 97:</strong> cesantía 60 años / vejez 65 (LSS arts. 154, 162); semanas mínimas en transición: 750 en 2021 +25 por año hasta 1,000 en 2031 — el cálculo usa las del año en que te retirarías (decreto DOF 16-dic-2020, transitorio Cuarto).</li>
              <li><strong>Aportaciones a tu cuenta:</strong> patrón 2% (retiro) + cuota patronal de cesantía y vejez <em>gradual 2023-2030 por nivel salarial</em> (3.150%–11.875%; el cálculo aplica la tabla del año que corresponde) + 1.125% tuyo + cuota social del Estado si ganas hasta 4 UMA (LSS art. 168; decreto DOF 16-dic-2020). Nota 2026: el salario mínimo ($315.04) equivale a 2.686 UMA, por lo que varias bandas intermedias de la tabla quedan vacías en la práctica.</li>
              <li><strong>Ley 73 (si cotizaste antes de jul-1997):</strong> fórmula del art. 167 (salario promedio de las últimas 250 semanas, tabla de cuantía básica e incrementos — cotejada contra DOF 27-dic-1990), factores por edad 60-64 del art. 171 (75%–95%), asignación del 15% (art. 164), piso 100% del salario mínimo (art. 168), techo 100% del salario promedio (art. 169).</li>
              <li><strong>Pensión garantizada:</strong> matriz oficial completa del art. 170 integrada (5 bandas salariales × 6 edades × 11 niveles de semanas, decreto DOF 16-dic-2020) — transcrita con doble verificación independiente (dos caminos coincidentes 330/330) y expresada en pesos de hoy con el INPC (la ley la actualiza cada febrero). Tu salario actual aproxima el promedio de tu vida laboral, el mismo criterio declarado que la Ley 73. Si tu proyección queda en la zona del mínimo de tu caso, la calculadora te muestra el monto exacto.</li>
            </ul></div></details>
          <details><summary><span className="tag tV">V</span> Datos oficiales vigentes usados</summary><div className="det-body">
            <ul>
              <li>UMA 2026: $117.31 diaria (INEGI, DOF 09-ene-2026).</li>
              <li>Salario mínimo 2026: $315.04 diario (CONASAMI, DOF 09-dic-2025).</li>
              <li>Comisiones AFORE 2026: promedio 0.538% (CONSAR) — el rendimiento del supuesto S1 ya es <em>neto</em> de comisiones.</li>
              <li>Tablas de supervivencia EMSSAH-09/EMSSAM-09 (CNSF, DOF 14-ago-2009, Anexo 4).</li>
              <li>Cuota social: valores vigentes ene-abr 2026 de la publicación oficial CONSAR (metodología de su calculadora, fuente versionada) — la ley los actualiza trimestralmente por INPC (LSS art. 168 F.IV); la réplica del factor con INPC INEGI reproduce las 7 bandas con diferencia ≤ $0.0001 diario.</li>
            </ul></div></details>
          <details><summary><span className="tag tS">S</span> Supuestos de proyección declarados <span className="hint">— escenario ilustrativo, no validación actuarial</span></summary><div className="det-body">
            <ul>
              <li><strong>Rendimiento real neto:</strong> tres escenarios — conservador 1.5%, base 3.0%, optimista 4.5% anual. <em>Parámetros de escenario ilustrativo.</em> Todo el cálculo es en pesos de hoy.</li>
              <li><strong>Conversión de saldo a pensión</strong> (validación actuarial 2026-07-02): renta vitalicia <em>actualizable anualmente con inflación</em> (tu pensión conserva poder adquisitivo), calculada con las tablas EMSSA-09 por sexo y <strong>tasa técnica real de 2.5%</strong>. Divisores por edad publicados abajo.</li>
              <li><strong>Crecimiento de tu salario:</strong> +1.0% real anual. <em>Parámetro de escenario ilustrativo.</em></li>
              <li><strong>Constancia de cotización:</strong> la eliges tú (presets ilustrativos 90/60/40 — resolución metodológica, no validación actuarial).</li>
              <li><strong>Semáforo:</strong> compara la pensión base contra tu salario actual — menos de 40% "por reforzar", 40-70% "a media construcción", 70%+ "encaminado". Umbrales metodológicos, públicos y discutibles.</li>
              <li><strong>Ley 73:</strong> tu salario actual se usa como aproximación del promedio de tus últimas 250 semanas.</li>
            </ul>
            <div className="scroll"><table>
              <caption style={{ textAlign: "left", fontSize: "11.5px", color: "var(--text-secondary)", padding: "4px 0" }}>Divisor de anualización (saldo ÷ divisor = pensión mensual en pesos de hoy) — EMSSA-09, tasa técnica real 2.5%</caption>
              <thead><tr><th>Edad de retiro</th><th>60</th><th>61</th><th>62</th><th>63</th><th>64</th><th>65</th><th>66</th><th>67</th><th>68</th><th>69</th><th>70</th></tr></thead>
              <tbody>
                <tr><td>Hombre</td><td>209.81</td><td>205.28</td><td>200.72</td><td>196.13</td><td>191.52</td><td>186.89</td><td>182.24</td><td>177.57</td><td>172.88</td><td>168.18</td><td>163.48</td></tr>
                <tr><td>Mujer</td><td>239.19</td><td>233.66</td><td>228.01</td><td>222.26</td><td>216.40</td><td>210.44</td><td>204.36</td><td>198.19</td><td>191.92</td><td>185.55</td><td>179.08</td></tr>
              </tbody></table></div>
          </div></details>
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
