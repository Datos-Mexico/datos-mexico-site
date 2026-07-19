"use client";

/* Comparador de escenarios de retiro — cuerpo portado TAL CUAL (D8) de
   el comparador de escenarios original: tres rutas lado a lado, curva pensión-vs-edad
   (60-70) con marcas, gráfica de acumulado esperado, tooltip .rh-tip. Reusa
   el motor validado de la calculadora de pensión (mismo engine.ts). */

import { useEffect, useRef } from "react";
import {
  P,
  proyectaLey97,
  comparaEdad,
  pmgAplicable,
  type EntradaLey97,
  type RutaComparador,
} from "@/lib/pensiones/calc/engine";
import "./comparador.css";

type InpCmp = EntradaLey97 & { edades: { A: number; B: number; C: number } };

export function ComparadorCalculator() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const $ = (id: string) => root.querySelector<HTMLElement>("#" + id)!;
    const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
    void REDUCED;
    const fmt = (n: number) => "$" + Math.round(n).toLocaleString("es-MX");
    const fmtK = (n: number) =>
      n >= 1e6 ? "$" + (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + " M" : "$" + Math.round(n / 1000) + " mil";
    const RUTAS = [
      { k: "A", tag: "Ruta A · anticipado", id: "edadA" },
      { k: "B", tag: "Ruta B · tu referencia", id: "edadB" },
      { k: "C", tag: "Ruta C · pospuesto", id: "edadC" },
    ] as const;

    function leeInputs(): InpCmp {
      return {
        edad: +($("edad") as HTMLInputElement).value,
        sexo: ($("sexo") as unknown as HTMLSelectElement).value as "H" | "M",
        salario: +($("salario") as HTMLInputElement).value,
        saldo: +($("saldo") as HTMLInputElement).value,
        semanas: +($("semanas") as HTMLInputElement).value,
        pre97: root!.querySelector<HTMLInputElement>("input[name=pre97]:checked")!.value === "si",
        densidad: +($("densidad") as HTMLInputElement).value / 100,
        voluntaria: +($("voluntaria") as HTMLInputElement).value,
        edadRetiro: 65,
        edades: { A: +($("edadA") as HTMLInputElement).value, B: +($("edadB") as HTMLInputElement).value, C: +($("edadC") as HTMLInputElement).value },
      };
    }

    const CV = { W: 660, H: 250, m: { t: 16, r: 74, b: 26, l: 52 } };
    function drawCurva(inp: InpCmp, marcas: { k: string; edadRetiro: number }[]) {
      const svg = $("cvChart");
      const { W, H, m } = CV;
      const iw = W - m.l - m.r, ih = H - m.t - m.b;
      const desde = Math.max(60, inp.edad + 1);
      const edades: number[] = [];
      for (let e = desde; e <= 70; e++) edades.push(e);
      const n = edades.length;
      if (n < 2) { svg.innerHTML = ""; $("cvTable").innerHTML = ""; return; }
      const serie = (k: "conservador" | "base" | "optimista") => edades.map((e) => ({ edad: e, v: proyectaLey97({ ...inp, edadRetiro: e }, P.TASAS[k]).pension }));
      const S = { conservador: serie("conservador"), base: serie("base"), optimista: serie("optimista") };
      const maxY = Math.max(...S.optimista.map((p) => p.v), 1) * 1.08;
      const X = (i: number) => m.l + iw * (i / (n - 1));
      const Y = (v: number) => m.t + ih * (1 - v / maxY);
      const path = (arr: { v: number }[]) => arr.map((p, i) => (i ? "L" : "M") + X(i).toFixed(1) + "," + Y(p.v).toFixed(1)).join("");
      const band = S.optimista.map((p, i) => (i ? "L" : "M") + X(i).toFixed(1) + "," + Y(p.v).toFixed(1)).join("")
        + S.conservador.slice().reverse().map((p, i) => "L" + X(n - 1 - i).toFixed(1) + "," + Y(p.v).toFixed(1)).join("") + "Z";
      let grid = "", labs = "";
      for (let g = 1; g <= 3; g++) {
        const v = maxY * g / 4, y = Y(v).toFixed(1);
        grid += `<line class="gridline" x1="${m.l}" y1="${y}" x2="${W - m.r}" y2="${y}"/>`;
        labs += `<text class="axis-lbl" x="${m.l - 6}" y="${+y + 3}" text-anchor="end">${fmtK(v)}</text>`;
      }
      edades.forEach((e, i) => {
        labs += `<text class="axis-lbl" x="${X(i).toFixed(1)}" y="${H - 8}" text-anchor="middle"${[inp.edades.A, inp.edades.B, inp.edades.C].includes(e) ? ' font-weight="700"' : ""}>${e}</text>`;
      });
      const endl = `<text class="endlab" x="${W - m.r + 6}" y="${(Y(S.base[n - 1].v) + 3.5).toFixed(1)}" fill="var(--navy)">${fmtK(S.base[n - 1].v)}</text>`;
      const dots = marcas.filter((mk) => mk.edadRetiro >= desde).map((mk) => {
        const i = mk.edadRetiro - desde;
        return `<circle cx="${X(i)}" cy="${Y(S.base[i].v)}" r="6" fill="var(--gold)" stroke="#fff" stroke-width="2"/>`
          + `<text class="endlab" x="${X(i)}" y="${(Y(S.base[i].v) - 11).toFixed(1)}" fill="var(--navy)" text-anchor="middle">${mk.k}</text>`;
      }).join("");
      svg.innerHTML = grid + labs
        + `<path d="${band}" fill="rgba(180,83,9,.13)"/>`
        + `<path d="${path(S.conservador)}" fill="none" stroke="var(--text-secondary)" stroke-width="1.4" stroke-dasharray="4 4"/>`
        + `<path d="${path(S.optimista)}" fill="none" stroke="var(--gold-light)" stroke-width="1.6"/>`
        + `<path d="${path(S.base)}" fill="none" stroke="var(--navy)" stroke-width="2.6" stroke-linecap="round"/>`
        + `<line id="cvGuide" class="guide" y1="${m.t}" y2="${H - m.b}" x1="0" x2="0"/>`
        + dots + endl
        + edades.map((e, i) =>
          `<rect class="hitcol" x="${(X(i) - iw / (n - 1) / 2).toFixed(1)}" y="${m.t}" width="${(iw / (n - 1)).toFixed(1)}" height="${ih}" data-i="${i}"/>`).join("");
      const tip = $("cvTip"), guide = svg.querySelector<SVGLineElement>("#cvGuide")!;
      svg.querySelectorAll<SVGRectElement>(".hitcol").forEach((r) => {
        const show = () => {
          const i = +r.dataset.i!;
          const req = proyectaLey97({ ...inp, edadRetiro: edades[i] }, P.TASAS.base);
          tip.innerHTML = `<span class="rh-tip__title">Retiro a los ${edades[i]} (${req.anioRetiro})</span>`
            + `<div class="rh-tip__detail">${fmt(S.base[i].v)} <span class="dim">/mes base</span></div>`
            + `<div class="rh-tip__detail"><span class="dim">${fmt(S.conservador[i].v)} - ${fmt(S.optimista[i].v)}</span></div>`
            + `<div class="rh-tip__detail"><span class="dim">${req.semanasFinales}/${req.reqSemanas} semanas${req.elegible ? "" : " — no alcanzaría el requisito"}</span></div>`;
          const wrap = $("cvWrap"), sw = wrap.clientWidth / W;
          tip.style.left = X(i) * sw + "px"; tip.style.top = Y(S.base[i].v) * wrap.clientHeight / H + "px";
          tip.classList.add("is-visible");
          guide.setAttribute("x1", String(X(i))); guide.setAttribute("x2", String(X(i))); guide.classList.add("on");
        };
        const hide = () => { tip.classList.remove("is-visible"); guide.classList.remove("on"); };
        r.addEventListener("mouseenter", show); r.addEventListener("mouseleave", hide);
        r.addEventListener("touchstart", (e) => { e.preventDefault(); show(); }, { passive: false });
      });
      $("cvTable").innerHTML = '<table><thead><tr><th>Edad de retiro</th><th>Conservador</th><th>Base</th><th>Optimista</th></tr></thead><tbody>'
        + edades.map((e, i) => `<tr><td>${e}</td><td>${fmt(S.conservador[i].v)}</td><td>${fmt(S.base[i].v)}</td><td>${fmt(S.optimista[i].v)}</td></tr>`).join("")
        + "</tbody></table>";
    }

    function render() {
      const inp = leeInputs();
      RUTAS.forEach((r) => { $(r.id + "Val").textContent = inp.edades[r.k as "A" | "B" | "C"] + " años"; });
      $("densidadVal").textContent = Math.round(inp.densidad * 100) + "%";
      $("voluntariaVal").textContent = fmt(inp.voluntaria);
      ([["edadA", 60, 70], ["edadB", 60, 70], ["edadC", 60, 70], ["densidad", 10, 100], ["voluntaria", 0, 5000]] as const).forEach(([id, min, max]) => {
        const el = $(id) as HTMLInputElement; el.style.setProperty("--pct", 100 * (+el.value - min) / (max - min) + "%");
      });
      const edadMin = Math.min(inp.edades.A, inp.edades.B, inp.edades.C);
      if (!(inp.edad >= 18 && inp.edad < edadMin)) {
        $("rutas").innerHTML = `<div class="note alert" style="grid-column:1/-1">Tu edad actual (${inp.edad}) debe ser menor que la edad de retiro más temprana que elegiste (${edadMin}). Ajusta las rutas o tu edad.</div>`;
        $("eligWarn").innerHTML = ""; $("l73Box").innerHTML = ""; $("bars").innerHTML = "";
        $("interp").textContent = ""; drawCurva(inp, []); return;
      }
      const R = RUTAS.map((r) => ({
        k: r.k, tag: r.tag,
        base: comparaEdad(inp, inp.edades[r.k as "A" | "B" | "C"], P.TASAS.base),
        cons: comparaEdad(inp, inp.edades[r.k as "A" | "B" | "C"], P.TASAS.conservador),
        opt: comparaEdad(inp, inp.edades[r.k as "A" | "B" | "C"], P.TASAS.optimista),
      }));
      const ref = R[1];
      $("rutas").innerHTML = R.map((r) => {
        const b = r.base;
        const dif = b.pension - ref.base.pension;
        const esRef = r.k === "B";
        const delta = esRef
          ? `<span class="delta zero">tu referencia</span>`
          : `<span class="delta ${dif >= 0 ? "up" : "down"}">${dif >= 0 ? "+" : "−"}${fmt(Math.abs(dif)).slice(1)} /mes vs ruta B</span>`;
        return `<div class="ruta${esRef ? " ref" : ""}">
          <span class="r-tag">${r.tag}</span>
          <span class="r-edad">${b.edadRetiro} años <span class="hint">· ${b.anioRetiro}</span></span>
          <span class="r-big">${fmt(b.pension)}<small> /mes</small></span>
          <span class="r-rango">rango ${fmt(r.cons.pension)} – ${fmt(r.opt.pension)}</span>
          ${delta}
          <div class="r-rows">
            <div class="rw"><span>De tu salario actual</span><b>≈ ${(100 * b.pension / inp.salario).toFixed(0)}%</b></div>
            <div class="rw"><span>Saldo proyectado</span><b>${fmt(b.saldoFinal)}</b></div>
            <div class="rw"><span>Semanas</span><b>${b.semanasFinales} / ${b.reqSemanas}</b></div>
            <div class="rw"><span>Años esperados de pensión</span><b>≈ ${b.ex.toFixed(1)}</b></div>
          </div>
          ${b.elegible ? "" : `<span class="r-warn">A esta edad no alcanzarías las semanas requeridas: la cifra muestra el ingreso que tu saldo sostendría si las cumplieras.</span>`}
          ${b.l73pension ? `<span class="r-l73">Fórmula Ley 73 (tu transición): <b>${fmt(b.l73pension)}</b> /mes — al pensionarte eliges la mayor.</span>` : ""}
        </div>`;
      }).join("");
      const noEleg = R.filter((r) => !r.base.elegible);
      $("eligWarn").innerHTML = noEleg.length
        ? `<div class="note alert"><strong>${noEleg.length === 1 ? "Una de tus rutas" : "Algunas de tus rutas"} no alcanzaría el requisito de semanas</strong> (${noEleg.map((r) => `ruta ${r.k}: ${r.base.semanasFinales} de ${r.base.reqSemanas}`).join(" · ")}). Retirarse más tarde suma semanas — y el requisito legal también sube hasta 2031. La <a href="/pensiones/calculadoras">calculadora de elegibilidad</a> muestra ese cruce a detalle.</div>` : "";
      const pmgR = R.map((r) => ({ k: r.k, base: r.base, pmg: pmgAplicable(r.base.edadRetiro, r.base.semanasFinales, inp.salario, r.base.anioRetiro) }))
        .filter((r) => r.pmg.aplica && r.base.pension < (r.pmg as { mensual: number }).mensual) as { k: string; base: RutaComparador; pmg: { aplica: true; mensual: number } }[];
      $("pmgNote").innerHTML = pmgR.length
        ? `<div class="note">En ${pmgR.length === 1 ? "una de tus rutas" : "varias de tus rutas"} la proyección base queda bajo la <strong>pensión garantizada</strong> de tu caso (LSS art. 170: matriz oficial del decreto DOF 16-dic-2020, actualizada por INPC): ${pmgR.map((r) => `ruta ${r.k} (${r.base.edadRetiro} años): garantía de <strong>${fmt(r.pmg.mensual)}</strong> vs proyección de ${fmt(r.base.pension)}`).join(" · ")}. Cumpliendo edad y semanas, el Estado cubre la diferencia hasta ese mínimo — tu salario actual aproxima el promedio de tu vida laboral (criterio declarado).</div>` : "";
      drawCurva(inp, R.map((r) => ({ k: r.k, edadRetiro: r.base.edadRetiro })));
      const maxAc = Math.max(...R.map((r) => r.base.acumulado), 1) * 1.12;
      $("bars").innerHTML = R.map((r) => {
        const b = r.base, w = 100 * b.acumulado / maxAc;
        return `<div class="bar-row" tabindex="0" aria-label="Ruta ${r.k}, retiro a los ${b.edadRetiro}: acumulado esperado ${fmt(b.acumulado)} en ${b.ex.toFixed(1)} años">
          <div class="b-lbl">A los ${b.edadRetiro}<span class="hint">≈ ${b.ex.toFixed(1)} años de cobro</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${w.toFixed(1)}%;background:${r.k === "B" ? "var(--gold)" : "var(--navy)"}"></div></div>
          <div class="bar-val">${fmtK(b.acumulado)}</div>
        </div>`;
      }).join("");
      $("l73Box").innerHTML = (inp.pre97 && R.some((r) => r.base.l73pension)) ? `<div class="note">
        <strong>Generación de transición:</strong> en cada ruta se muestra también la fórmula de la <strong>Ley 73</strong>, cuyo factor por edad premia esperar (60→75% … 65→100%, art. 171). Al pensionarte, la ley te deja elegir el esquema mayor y el IMSS está obligado a calcularte ambos (transitorios Tercero y Cuarto, LSS 1997).</div>` : "";
      const difCA = R[2].base.pension - R[0].base.pension;
      const difAcum = R[2].base.acumulado - R[0].base.acumulado;
      $("interp").textContent = `Entre tu ruta más temprana (${R[0].base.edadRetiro}) y la más tardía (${R[2].base.edadRetiro}) hay ${fmt(Math.abs(difCA))} de diferencia mensual en el escenario base: posponer acumula más saldo, usa un divisor menor y — si vienes de antes de 1997 — sube el factor de la Ley 73. La otra cara: retirarte a los ${R[0].base.edadRetiro} significa cobrar ≈${R[0].base.ex.toFixed(1)} años esperados y a los ${R[2].base.edadRetiro} ≈${R[2].base.ex.toFixed(1)}, así que el acumulado esperado ${difAcum >= 0 ? "aun así favorece a la ruta tardía" : "favorece a la ruta temprana"} por ${fmtK(Math.abs(difAcum))} — con tus datos, no como regla general. Ninguna ruta es una recomendación: cada edad implica también más o menos años de trabajo, salud y planes que solo tú puedes pesar. La calculadora muestra las consecuencias; la decisión es tuya.`;
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
      el.addEventListener("input", h);
      handlers.push([el, h]);
    });
    const onResize = () => render();
    addEventListener("resize", onResize);
    render();
    return () => {
      handlers.forEach(([el, h]) => el.removeEventListener("input", h));
      removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="calc-root" ref={rootRef}>
      <link rel="stylesheet" href="/pensiones/sar-29/vendor/fonts.css" precedence="default" />
      <div className="wrap">
        <header className="top">
          <div>
            <div className="kicker">Datos México · Calculadoras</div>
            <h1>¿Retirarte antes, a tiempo o después? Compara las rutas</h1>
            <p className="sub">Elige <strong>tres edades de retiro</strong> y compáralas lado a lado con el mismo motor validado de la calculadora de pensión: mensualidad, requisitos y acumulado esperado. Retirarte después sube la mensualidad — y acorta los años de cobro. <strong>Las dos caras se muestran; la decisión es tuya.</strong></p>
          </div>
          <div className="hero-meta">Vigencia de supuestos: <b>2026</b><br />Base: documento actuarial v1.0 · validación actuarial 2026-07-02<br />Motor de la calculadora de pensión, sin cambios</div>
        </header>

        <div className="calc-grid">
          <aside className="panel" id="f">
            <span className="step">Paso 1 · Cuéntanos dónde estás</span>
            <h2>Tus datos</h2>
            <div className="fgrid">
              <div className="field"><label htmlFor="edad">Edad actual</label><input type="number" id="edad" min={18} max={69} defaultValue={45} /></div>
              <div className="field"><label htmlFor="sexo">Sexo <span className="hint">(EMSSA-09 difiere por sexo)</span></label>
                <select id="sexo" defaultValue="H"><option value="H">Hombre</option><option value="M">Mujer</option></select></div>
              <div className="field"><label htmlFor="salario">Salario mensual bruto <span className="hint">aprox. tu SBC</span></label><input type="number" id="salario" min={0} step={500} defaultValue={15000} /></div>
              <div className="field"><label htmlFor="saldo">Saldo en tu AFORE <span className="hint">0 si no lo sabes</span></label><input type="number" id="saldo" min={0} step={1000} defaultValue={300000} /></div>
              <div className="field"><label htmlFor="semanas">Semanas cotizadas</label><input type="number" id="semanas" min={0} max={3000} defaultValue={900} /></div>
              <div className="field"><label>¿Cotizaste antes de jul-1997?</label>
                <div className="radio-row" role="radiogroup">
                  <label><input type="radio" name="pre97" value="no" defaultChecked /> No</label>
                  <label><input type="radio" name="pre97" value="si" /> Sí</label>
                </div></div>
            </div>
            <div className="slider-block">
              <div className="slider-head"><label htmlFor="edadA">Ruta A — retiro anticipado</label><span className="val" id="edadAVal">60 años</span></div>
              <input type="range" id="edadA" min={60} max={70} step={1} defaultValue={60} aria-describedby="edadAVal" />
              <div className="slider-scale"><span>60</span><span>65</span><span>70</span></div>
            </div>
            <div className="slider-block">
              <div className="slider-head"><label htmlFor="edadB">Ruta B — tu edad de referencia</label><span className="val" id="edadBVal">65 años</span></div>
              <input type="range" id="edadB" min={60} max={70} step={1} defaultValue={65} aria-describedby="edadBVal" />
              <div className="slider-scale"><span>60</span><span>65</span><span>70</span></div>
            </div>
            <div className="slider-block">
              <div className="slider-head"><label htmlFor="edadC">Ruta C — retiro pospuesto</label><span className="val" id="edadCVal">68 años</span></div>
              <input type="range" id="edadC" min={60} max={70} step={1} defaultValue={68} aria-describedby="edadCVal" />
              <div className="slider-scale"><span>60</span><span>65</span><span>70</span></div>
            </div>
            <div className="slider-block">
              <div className="slider-head"><label htmlFor="densidad">Constancia de cotización <span className="hint">parte del tiempo restante cotizando</span></label><span className="val" id="densidadVal">90%</span></div>
              <input type="range" id="densidad" min={10} max={100} step={5} defaultValue={90} aria-describedby="densidadVal" />
              <div className="slider-scale"><span>intermitente 40</span><span>mixto 60</span><span>continuo 90</span></div>
            </div>
            <div className="slider-block">
              <div className="slider-head"><label htmlFor="voluntaria">Aportación voluntaria mensual</label><span className="val" id="voluntariaVal">$0</span></div>
              <input type="range" id="voluntaria" min={0} max={5000} step={100} defaultValue={0} aria-describedby="voluntariaVal" />
              <div className="slider-scale"><span>$0</span><span>$2,500</span><span>$5,000</span></div>
            </div>
          </aside>

          <section className="results">
            <div className="card">
              <span className="step">Paso 2 · Las tres rutas, lado a lado</span>
              <h3>La misma trayectoria, tres puertas de salida <span className="hint">— pensión mensual, escenario base (3.0% real), pesos de hoy</span></h3>
              <div className="rutas" id="rutas"></div>
            </div>
            <div id="eligWarn"></div>
            <div id="pmgNote"></div>
            <div className="card">
              <span className="step">La curva completa</span>
              <h3>Tu pensión mensual por cada edad de retiro posible <span className="hint">— 60 a 70, con tus tres rutas marcadas</span></h3>
              <div className="viz-wrap" id="cvWrap">
                <svg id="cvChart" viewBox="0 0 660 250" role="img" aria-label="Pensión mensual estimada según edad de retiro, de 60 a 70 años, en tres escenarios"></svg>
                <div className="rh-tip" id="cvTip" aria-hidden="true"></div>
              </div>
              <div className="viz-legend">
                <span className="l-band"><i></i>rango conservador–optimista</span>
                <span style={{ color: "var(--navy)" }}><i style={{ borderColor: "var(--navy)" }}></i>base 3.0%</span>
                <span style={{ color: "var(--gold)" }}>● tus tres rutas</span>
              </div>
              <details style={{ margin: "10px 0 0", border: "none", background: "none" }}><summary style={{ padding: "4px 0", fontSize: "12px" }}>Ver los datos de esta gráfica</summary><div className="det-body scroll" id="cvTable" style={{ padding: "6px 0 2px" }}></div></details>
            </div>
            <div className="card">
              <span className="step">La otra cara</span>
              <h3>Acumulado esperado durante el retiro <span className="hint">— mensualidad × 12 × años de esperanza de vida a esa edad (EMSSA-09)</span></h3>
              <div className="bars" id="bars"></div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "10px 0 0" }}>Es una <strong>multiplicación informativa, no una proyección financiera</strong>: posponer da mensualidad más alta durante menos años esperados; anticipar, lo contrario. La esperanza de vida es un promedio — la mitad de las personas vive más.</p>
            </div>
            <div id="l73Box"></div>
            <div className="card">
              <span className="step">Paso 3 · Qué significa</span>
              <h3>Lectura de tu resultado</h3>
              <p className="interp" id="interp"></p>
            </div>
            <div className="card">
              <span className="step">Paso 4 · Siguiente paso</span>
              <h3>Para seguir entendiendo</h3>
              <div className="next">
                <a href="/pensiones/calculadoras/pension">Tu proyección completa a una edad (calculadora de pensión)</a>
                <a href="/pensiones/sar-29">La serie “El SAR en 29 años”</a>
                <a href="#supuestos">Metodología y supuestos</a>
              </div>
            </div>
          </section>
        </div>

        <div className="lower">
          <h2 id="supuestos" style={{ fontFamily: "Merriweather,Georgia,serif", color: "var(--navy)", fontSize: "19px", margin: "0 0 4px" }}>Metodología y supuestos <span className="hint">— vigencia: 2026 · documento base actuarial v1.0</span></h2>
          <details><summary><span className="tag tR">R</span> Reglas de ley que aplica el cálculo (fuentes oficiales versionadas)</summary><div className="det-body">
            <ul>
              <li><strong>Cada ruta corre el motor validado de la calculadora de pensión estimada, sin cambios:</strong> proyección Ley 97 (aportaciones art. 168 LSS, cuota patronal gradual, cuota social), requisitos de edad y semanas en transición (arts. 154/162 y decreto DOF 16-dic-2020), y — si cotizaste antes de jul-1997 — la fórmula de la Ley 73 (arts. 167-171) con el derecho de elegir el esquema mayor (transitorio Tercero).</li>
              <li><strong>La palanca legal de la comparación:</strong> en Ley 97, retirarte más tarde acumula más saldo y usa un divisor menor (menos años por financiar); en Ley 73, la cuantía de cesantía crece con la edad — 60→75%, 61→80%, 62→85%, 63→90%, 64→95%, 65→100% (art. 171) — y las semanas extra suman incrementos (art. 167).</li>
              <li><strong>Pensión garantizada (art. 170):</strong> matriz oficial completa integrada (decreto DOF 16-dic-2020, transcrita con doble verificación independiente y actualizada a pesos de hoy por INPC) — si alguna ruta queda bajo el mínimo de tu caso, la calculadora lo señala con el monto exacto.</li>
              <li><strong>Retiro antes de los 60</strong> (art. 158, requiere que la renta supere en &gt;30% la pensión garantizada): fuera del alcance v1, declarado. Por eso las rutas van de 60 a 70.</li>
            </ul></div></details>
          <details><summary><span className="tag tV">V</span> Datos oficiales vigentes usados</summary><div className="det-body">
            <ul>
              <li>UMA 2026: $117.31 diaria (INEGI, DOF 09-ene-2026) · Salario mínimo 2026: $315.04 diario (CONASAMI, DOF 09-dic-2025).</li>
              <li>Tablas de supervivencia EMSSAH-09/EMSSAM-09 (CNSF, DOF 14-ago-2009, Anexo 4): divisores de anualización y esperanza de vida condicionada por edad y sexo.</li>
              <li>Comisiones AFORE 2026: promedio 0.538% (CONSAR) — el rendimiento del supuesto S1 ya es <em>neto</em> de comisiones.</li>
            </ul></div></details>
          <details><summary><span className="tag tS">S</span> Supuestos de proyección declarados <span className="hint">— escenario ilustrativo, no validación actuarial</span></summary><div className="det-body">
            <ul>
              <li><strong>Rendimiento real neto:</strong> tres escenarios — conservador 1.5%, base 3.0%, optimista 4.5% anual. <em>Parámetros de escenario ilustrativo.</em> Todo en pesos de hoy.</li>
              <li><strong>Conversión de saldo a pensión</strong> (validación actuarial 2026-07-02): renta vitalicia actualizable con inflación, divisores EMSSA-09 por sexo a <strong>tasa técnica real de 2.5%</strong> — el mismo factor S7 de las demás calculadoras, por edad de retiro (60-70).</li>
              <li><strong>Acumulado esperado</strong> = pensión mensual × 12 × esperanza de vida <em>condicionada a la edad de retiro</em> (EMSSA-09, S6). Es una multiplicación informativa para mostrar la otra cara de posponer, no una proyección financiera — definición metodológica pública de este comparador.</li>
              <li><strong>Crecimiento de tu salario:</strong> +1.0% real anual · <strong>Constancia:</strong> la eliges tú (presets ilustrativos 90/60/40).</li>
              <li><strong>Ley 73:</strong> tu salario actual como aproximación del promedio de tus últimas 250 semanas.</li>
              <li><strong>Ninguna ruta se recomienda:</strong> si una edad no alcanza las semanas requeridas, se muestra el ingreso que el saldo sostendría, con la advertencia — el mismo criterio honesto de la calculadora de pensión.</li>
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
