"use client";

/* Calculadora de gastos médicos en retiro — cuerpo portado TAL CUAL (D8):
   proyección del gasto de bolsillo en salud por edad (tres escenarios de
   inflación médica), gráfica con banda y zona de retiro sombreada, tooltip,
   acumulado en rango, tarjeta sí-es/no-es. Referencia [V] ENIGH + INPC.
   Motor en lib/pensiones/calc/calculos-c. */

import { useEffect, useRef } from "react";
import { bandaSalud, referenciaSaludMensual, proyectaGastoMedico, DIF_MED, type EntradaGastosMedicos } from "@/lib/pensiones/calc/calculos-c";
import "./gastos-medicos.css";

export function GastosMedicosCalculator() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const $ = (id: string) => root.querySelector<HTMLElement>("#" + id)!;
    const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fmt = (n: number) => "$" + Math.round(n).toLocaleString("es-MX");
    const fmtM = (n: number) => n >= 1e6 ? "$" + (n / 1e6).toFixed(1) + " millones" : fmt(n);
    const ESC = [
      { k: "igual", lbl: "Igual a la general", pp: "0", color: "var(--text-secondary)" },
      { k: "historico", lbl: "Histórico", pp: "+0.2", color: "var(--navy)" },
      { k: "alto", lbl: "Sostenida alta", pp: "+1.5", color: "var(--gold)" },
    ] as const;
    const INPC_ANUAL: [number, number, number][] = [
      [2010, 4.40, 4.63], [2011, 3.82, 3.57], [2012, 3.57, 3.89], [2013, 3.97, 3.94], [2014, 4.08, 3.76],
      [2015, 2.13, 4.13], [2016, 3.36, 5.04], [2017, 6.77, 4.78], [2018, 4.83, 4.97], [2019, 2.83, 4.05],
      [2020, 3.15, 4.61], [2021, 7.36, 4.46], [2022, 7.82, 6.50], [2023, 4.66, 6.03], [2024, 4.21, 4.46], [2025, 3.69, 5.02],
    ];

    function leeInputs(): EntradaGastosMedicos {
      return { edad: +($("edad") as HTMLInputElement).value, sexo: ($("sexo") as unknown as HTMLSelectElement).value as "H" | "M", edadRetiro: +($("edadret") as unknown as HTMLSelectElement).value, gastoHoy: +($("gastohoy") as HTMLInputElement).value };
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
    type Serie = ReturnType<typeof proyectaGastoMedico>;
    const MC = { W: 660, H: 250, m: { t: 16, r: 74, b: 26, l: 52 } };
    function drawMed(series: Record<string, Serie>, inp: EntradaGastosMedicos) {
      const svg = $("medChart");
      const { W, H, m } = MC;
      const iw = W - m.l - m.r, ih = H - m.t - m.b;
      const base = series.historico.serie;
      const n = base.length;
      const maxY = Math.max(series.alto.serie[n - 1].mensual, 1) * 1.08;
      const X = (i: number) => m.l + iw * (n === 1 ? 0 : i / (n - 1));
      const Y = (v: number) => m.t + ih * (1 - v / maxY);
      const path = (arr: { mensual: number }[]) => arr.map((p, i) => (i ? "L" : "M") + X(i).toFixed(1) + "," + Y(p.mensual).toFixed(1)).join("");
      const band = series.alto.serie.map((p, i) => (i ? "L" : "M") + X(i).toFixed(1) + "," + Y(p.mensual).toFixed(1)).join("")
        + series.igual.serie.slice().reverse().map((p, i) => "L" + X(n - 1 - i).toFixed(1) + "," + Y(p.mensual).toFixed(1)).join("") + "Z";
      const iRet = base.findIndex((p) => p.edad === inp.edadRetiro);
      let grid = "", labs = "";
      for (let g = 1; g <= 3; g++) {
        const v = maxY * g / 4, y = Y(v).toFixed(1);
        grid += `<line class="gridline" x1="${m.l}" y1="${y}" x2="${W - m.r}" y2="${y}"/>`;
        labs += `<text class="axis-lbl" x="${m.l - 6}" y="${+y + 3}" text-anchor="end">${fmt(v)}</text>`;
      }
      const stepX = Math.max(1, Math.ceil(n / 7));
      for (let i = 0; i < n; i += stepX) {
        if (i > n - 1 - stepX * 0.65) continue;
        labs += `<text class="axis-lbl" x="${X(i).toFixed(1)}" y="${H - 8}" text-anchor="middle">${base[i].edad}</text>`;
      }
      labs += `<text class="axis-lbl" x="${X(n - 1).toFixed(1)}" y="${H - 8}" text-anchor="middle" font-weight="700">${base[n - 1].edad}</text>`;
      const ends = ESC.map((e) => { const v = series[e.k].serie[n - 1].mensual; return { v, color: e.color, y: Y(v) + 3.5 }; }).sort((a, b) => a.y - b.y);
      for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 11) ends[i].y = ends[i - 1].y + 11;
      const endl = ends.map((o) => `<text class="endlab" x="${W - m.r + 6}" y="${o.y.toFixed(1)}" fill="${o.color}">${fmt(o.v)}</text>`).join("");
      const zonaRet = iRet >= 0
        ? `<rect x="${X(iRet).toFixed(1)}" y="${m.t}" width="${(X(n - 1) - X(iRet)).toFixed(1)}" height="${ih}" fill="rgba(21,128,61,.05)"/>`
        + `<line x1="${X(iRet).toFixed(1)}" y1="${m.t}" x2="${X(iRet).toFixed(1)}" y2="${H - m.b}" stroke="var(--navy)" stroke-width="1.4" stroke-dasharray="5 4" opacity=".55"/>`
        + `<text class="axis-lbl" x="${(X(iRet) + 4).toFixed(1)}" y="${m.t + 11}" fill="var(--navy)" font-weight="700">retiro</text>`
        : "";
      svg.innerHTML = grid + zonaRet + labs
        + `<path d="${band}" fill="rgba(180,83,9,.12)"/>`
        + `<path d="${path(series.igual.serie)}" fill="none" stroke="var(--text-secondary)" stroke-width="1.6" stroke-dasharray="4 4"/>`
        + `<path d="${path(series.alto.serie)}" fill="none" stroke="var(--gold)" stroke-width="2"/>`
        + `<path d="${path(series.historico.serie)}" fill="none" stroke="var(--navy)" stroke-width="2.6" stroke-linecap="round"/>`
        + `<line id="medGuide" class="guide" y1="${m.t}" y2="${H - m.b}" x1="0" x2="0"/>`
        + endl
        + base.map((p, i) => `<rect class="hitcol" x="${(X(i) - iw / (Math.max(n - 1, 1)) / 2).toFixed(1)}" y="${m.t}" width="${(iw / Math.max(n - 1, 1)).toFixed(1)}" height="${ih}" data-i="${i}"/>`).join("");
      const tip = $("medTip"), guide = svg.querySelector<SVGLineElement>("#medGuide")!;
      svg.querySelectorAll<SVGRectElement>(".hitcol").forEach((r) => {
        const show = () => {
          const i = +r.dataset.i!, p = base[i];
          tip.innerHTML = `<span class="rh-tip__title">A los ${p.edad} años</span>`
            + `<div class="rh-tip__detail">${fmt(p.mensual)} <span class="dim">/mes histórico</span></div>`
            + `<div class="rh-tip__detail"><span class="dim">${fmt(series.igual.serie[i].mensual)} - ${fmt(series.alto.serie[i].mensual)} rango</span></div>`;
          const wrap = $("medWrap"), sw = wrap.clientWidth / W;
          tip.style.left = X(i) * sw + "px"; tip.style.top = Y(p.mensual) * wrap.clientHeight / H + "px";
          tip.classList.add("is-visible");
          guide.setAttribute("x1", String(X(i))); guide.setAttribute("x2", String(X(i))); guide.classList.add("on");
        };
        const hide = () => { tip.classList.remove("is-visible"); guide.classList.remove("on"); };
        r.addEventListener("mouseenter", show); r.addEventListener("mouseleave", hide);
        r.addEventListener("touchstart", (e) => { e.preventDefault(); show(); }, { passive: false });
      });
      $("medTable").innerHTML = '<table><thead><tr><th>Edad</th><th>Igual a la general</th><th>Histórico</th><th>Sostenida alta</th></tr></thead><tbody>'
        + base.map((p, i) => `<tr><td>${p.edad}</td><td>${fmt(series.igual.serie[i].mensual)}</td><td>${fmt(p.mensual)}</td><td>${fmt(series.alto.serie[i].mensual)}</td></tr>`).join("")
        + "</tbody></table>";
    }
    let prevBig = 0;
    function render() {
      const inp = leeInputs();
      $("gastohoyVal").textContent = fmt(inp.gastoHoy);
      const el = $("gastohoy") as HTMLInputElement; el.style.setProperty("--pct", 100 * +el.value / 8000 + "%");
      $("refMini").textContent = "referencia ENIGH de tu edad (" + bandaSalud(inp.edad) + "s, por hogar): " + fmt(referenciaSaludMensual(inp.edad)) + " /mes";
      if (!(inp.edad >= 30 && inp.edad < inp.edadRetiro)) { $("bigMed").innerHTML = "—<small> revisa tu edad</small>"; return; }
      const series = Object.fromEntries(ESC.map((e) => [e.k, proyectaGastoMedico(inp, DIF_MED[e.k])])) as Record<string, Serie>;
      const rb = series.historico;
      tween(prevBig, rb.promedioRetiro, 420, (k) => { $("bigMed").innerHTML = fmt(lerp(prevBig, rb.promedioRetiro, k)) + "<small> /mes</small>"; });
      prevBig = rb.promedioRetiro;
      const razon = referenciaSaludMensual(75) / referenciaSaludMensual(65);
      $("chipCurva").textContent = "la referencia 70s gasta " + razon.toFixed(2).replace(".", ",") + "× la de 60s";
      $("heroSide").innerHTML =
        `<div class="row"><span>Al retirarte (${inp.edadRetiro})</span><b>${fmt(rb.alRetiro)} /mes</b></div>`
        + `<div class="row"><span>Al final del horizonte (${rb.horizonte})</span><b>${fmt(rb.alFinal)} /mes</b></div>`
        + `<div class="row"><span>Años de retiro (EMSSA)</span><b>≈ ${rb.ex.toFixed(1)}</b></div>`
        + `<div class="row" style="border:none"><span>Rango entre escenarios (prom.)</span><b>${fmt(series.igual.promedioRetiro)} – ${fmt(series.alto.promedioRetiro)}</b></div>`;
      drawMed(series, inp);
      $("acumBox").innerHTML = `<span class="step">El retiro completo, en rango</span>
        <h3>Gasto de bolsillo en salud acumulado durante tu retiro</h3>
        <div class="bigcap">${fmtM(series.igual.acumulado)} – ${fmtM(series.alto.acumulado)} <span class="hint">en pesos de hoy, ≈ ${rb.aniosRetiro} años</span></div>
        <p>Suma directa del gasto anual proyectado entre tu retiro (${inp.edadRetiro}) y el horizonte EMSSA (${rb.horizonte}). El rango entre escenarios de inflación médica es la incertidumbre honesta — escenario histórico: <strong>${fmtM(rb.acumulado)}</strong>. No incluye eventos catastróficos ni cuidados de largo plazo (declarado arriba).</p>
        <div class="ac-range">
          <span>por año, al inicio del retiro: <b>${fmt(rb.alRetiro * 12)}</b></span>
          <span>por año, al final: <b>${fmt(rb.alFinal * 12)}</b></span>
        </div>`;
      const vsHogar = inp.gastoHoy / referenciaSaludMensual(inp.edad);
      const nivelTxt = vsHogar > 1.3 ? "por encima del" : (vsHogar < 0.7 ? "por debajo del" : "cerca del");
      $("interp").textContent = `Partiendo del nivel que fijaste (${fmt(inp.gastoHoy)} al mes hoy, ${nivelTxt} hogar promedio de tu edad), el gasto de bolsillo en salud de tu hogar rondaría ${fmt(rb.alRetiro)} mensuales al retirarte a los ${inp.edadRetiro} y ${fmt(rb.alFinal)} hacia los ${rb.horizonte}, en pesos de hoy — porque los hogares mayores documentadamente gastan más en salud (ENIGH) y la inflación médica ha corrido ligeramente por encima de la general (INPC). El acumulado de tu retiro quedaría entre ${fmtM(series.igual.acumulado)} y ${fmtM(series.alto.acumulado)}. Es un orden de magnitud documentado para presupuestar con calma — no un pronóstico de tu salud, y las decisiones sobre cómo cubrirlo son tuyas.`;
      $("inpcTable").innerHTML = '<table><caption style="text-align:left;font-size:11.5px;color:var(--text-secondary);padding:4px 0">Inflación dic/dic (INEGI): general vs subíndice 5.1 Salud</caption><thead><tr><th>Año</th><th>General %</th><th>Salud %</th><th>Diferencial pp</th></tr></thead><tbody>'
        + INPC_ANUAL.map(([y, g, s]) => `<tr><td>${y}</td><td>${g.toFixed(2)}</td><td>${s.toFixed(2)}</td><td>${(s - g) >= 0 ? "+" : ""}${(s - g).toFixed(2)}</td></tr>`).join("")
        + "</tbody></table>";
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
            <h1>¿Cuánto podría costar tu salud durante el retiro?</h1>
            <p className="sub">Lo que los hogares mexicanos <strong>documentadamente gastan de su bolsillo</strong> en salud sube con la edad (ENIGH 2024, INEGI). Esta calculadora proyecta ese orden de magnitud para tu caso, en <strong>pesos de hoy</strong> y en rangos — sin dramatizar y sin prometer calma. No es un pronóstico médico ni financiero.</p>
          </div>
          <div className="hero-meta">Vigencia de supuestos: <b>2026</b><br />Gasto por edad: ENIGH 2024 · Inflación médica: INPC (INEGI)<br />Horizonte: EMSSA-09 (esperanza condicionada)</div>
        </header>
        <div className="calc-grid">
          <aside className="panel" id="f">
            <span className="step">Paso 1 · Tu punto de partida</span>
            <h2>Tus datos</h2>
            <div className="fgrid">
              <div className="field"><label htmlFor="edad">Edad actual</label><input type="number" id="edad" min={30} max={69} defaultValue={45} /></div>
              <div className="field"><label htmlFor="sexo">Sexo <span className="hint">(horizonte EMSSA-09)</span></label>
                <select id="sexo" defaultValue="H"><option value="H">Hombre</option><option value="M">Mujer</option></select></div>
              <div className="field"><label htmlFor="edadret">Edad de retiro</label>
                <select id="edadret" defaultValue="65"><option>60</option><option>61</option><option>62</option><option>63</option><option>64</option><option>65</option><option>66</option><option>67</option><option>68</option><option>69</option><option>70</option></select></div>
            </div>
            <div className="slider-block">
              <div className="slider-head"><label htmlFor="gastohoy">Gasto de bolsillo mensual de tu hogar en salud, hoy <span className="hint">consultas, medicinas, dentista, lentes…</span></label><span className="val" id="gastohoyVal">$475</span></div>
              <input type="range" id="gastohoy" min={0} max={8000} step={25} defaultValue={475} aria-describedby="gastohoyVal" />
              <div className="slider-scale"><span>$0</span><span>$4,000</span><span>$8,000</span></div>
              <div className="ref-mini" id="refMini"></div>
            </div>
          </aside>
          <section className="results">
            <div className="card hero-res">
              <div>
                <span className="step">Paso 2 · Tu gasto médico proyectado</span>
                <div className="lbl">Gasto de bolsillo mensual promedio durante tu retiro — escenario histórico, pesos de hoy</div>
                <div className="big" id="bigMed">$0<small> /mes</small></div>
                <span className="chip" id="chipCurva">—</span>
              </div>
              <div className="hero-side" id="heroSide"></div>
            </div>
            <div className="card">
              <span className="step">La curva de tu gasto en salud</span>
              <h3>Tu gasto de bolsillo en salud, por edad <span className="hint">— tres escenarios de inflación médica; la zona sombreada es tu retiro</span></h3>
              <div className="viz-wrap" id="medWrap">
                <svg id="medChart" viewBox="0 0 660 250" role="img" aria-label="Gasto de bolsillo en salud proyectado por edad, tres escenarios de inflación médica"></svg>
                <div className="rh-tip" id="medTip" aria-hidden="true"></div>
              </div>
              <div className="viz-legend">
                <span style={{ color: "var(--navy)" }}><i style={{ borderColor: "var(--navy)" }}></i>histórico (+0.2 pp)</span>
                <span style={{ color: "var(--gold)" }}><i style={{ borderColor: "var(--gold)" }}></i>sostenida alta (+1.5 pp)</span>
                <span><i style={{ borderColor: "var(--text-secondary)", borderTopStyle: "dashed" }}></i>igual a la general</span>
              </div>
              <details style={{ margin: "10px 0 0", border: "none", background: "none" }}><summary style={{ padding: "4px 0", fontSize: "12px" }}>Ver los datos de esta gráfica</summary><div className="det-body scroll" id="medTable" style={{ padding: "6px 0 2px" }}></div></details>
            </div>
            <div className="card acum" id="acumBox"></div>
            <div className="card">
              <span className="step">Rigor honesto</span>
              <h3>Qué es — y qué no es — este número</h3>
              <div className="esnoes">
                <div className="col"><b>Sí es</b>
                  <ul>
                    <li>El <strong>gasto de bolsillo</strong> que los hogares mexicanos efectivamente hacen (ENIGH 2024): consultas, medicinas, dentista, lentes, análisis — incluyendo a quienes se atienden en IMSS/ISSSTE/Bienestar.</li>
                    <li>Un <strong>orden de magnitud documentado</strong> para presupuestar, actualizado con la inflación médica observada (INPC).</li>
                    <li>Un promedio por <strong>hogar</strong> (2.8 integrantes en hogares 65+), escalado al nivel que tú fijaste.</li>
                  </ul>
                </div>
                <div className="col"><b>No es</b>
                  <ul>
                    <li>El costo de la <strong>medicina privada integral</strong> ni de un padecimiento específico.</li>
                    <li>Un modelo de <strong>eventos catastróficos</strong>: una hospitalización mayor no está en el promedio que ves.</li>
                    <li><strong>Cuidados de largo plazo</strong> (asistencia, dependencia) — tema de una calculadora futura.</li>
                    <li>Una predicción de tu salud, ni una recomendación de producto alguno.</li>
                  </ul>
                </div>
              </div>
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
                <a href="/pensiones/calculadoras/gasto-vida">La salud dentro de tu presupuesto completo (gasto de vida)</a>
                <a href="/pensiones/calculadoras/brecha">¿Tu plan lo sostiene? (calculadora de brecha)</a>
                <a href="#supuestos">Metodología y supuestos</a>
              </div>
            </div>
          </section>
        </div>
        <div className="lower">
          <h2 id="supuestos" style={{ fontFamily: "Merriweather,Georgia,serif", color: "var(--navy)", fontSize: "19px", margin: "0 0 4px" }}>Metodología y supuestos <span className="hint">— vigencia: 2026 · documento base actuarial v1.0</span></h2>
          <details><summary><span className="tag tV">V</span> Los datos: gasto por edad (ENIGH 2024) e inflación médica (INPC)</summary><div className="det-body">
            <ul>
              <li><strong>Gasto de bolsillo en salud por edad:</strong> rubro "cuidados de la salud" del gasto corriente monetario, promedio trimestral por hogar según edad del jefe(a), ENIGH 2024 (INEGI) — cálculo propio con microdatos oficiales, validado contra los cuadros publicados. Trimestral, pesos de 2024, bandas decenales: 30-39: $1,286 · 40-49: $1,312 · 50-59: $1,611 · 60-69: $1,909 · 70-79: $2,315 · 80+: $2,501. Dato <em>verificado</em>.</li>
              <li><strong>Inflación médica:</strong> subíndice "5.1 Salud" del INPC vs índice general (INEGI, series 865896/865586, dic/dic 2010-2025): salud promedió 4.61% anual vs 4.42% general — diferencial +0.2 pp. Honestidad del dato: es un diferencial modesto (no los 2-4 pp que suele citar la industria aseguradora); salud superó a la general en 10 de 16 años.</li>
              <li>Actualización a pesos de 2026 por INPC observado (factor 1.0655, convención del levantamiento ENIGH declarada).</li>
            </ul>
            <div className="scroll" id="inpcTable"></div>
          </div></details>
          <details><summary><span className="tag tS">S</span> Supuestos de proyección declarados <span className="hint">— escenario ilustrativo</span></summary><div className="det-body">
            <ul>
              <li><strong>Curva de edad transversal:</strong> la progresión de tu gasto al envejecer se aproxima con las razones entre bandas de edad de la ENIGH 2024 (p. ej. el hogar 70-79 gasta 1.21× el de 60-69). Es un corte de hogares distintos en 2024, no el seguimiento de las mismas personas — aproximación declarada.</li>
              <li><strong>Inflación médica real:</strong> tres escenarios deterministas del diferencial salud−general: 0 (igual a la general), +0.2 pp (promedio observado 2010-2025) y +1.5 pp (orden de magnitud de los años altos). <em>Parámetros de escenario ilustrativo.</em></li>
              <li><strong>Tu nivel de partida:</strong> lo fijas tú (control transparente); la proyección escala la curva de referencia a tu nivel.</li>
              <li><strong>Horizonte:</strong> esperanza de vida condicionada EMSSA-09 por sexo (validación actuarial). El acumulado cubre solo los años de retiro y es suma directa en pesos reales (sin rendimientos).</li>
              <li><strong>Todo en rangos:</strong> por línea roja de rigor, ninguna cifra única pretende precisión — el rango entre escenarios es la incertidumbre honesta.</li>
            </ul></div></details>
          <div className="disclaimers">
            <strong>Aviso importante</strong> <span className="hint">(texto dictaminado — revisión legal externa)</span>
            <ul>
              <li>Esta herramienta <strong>no es asesoría financiera ni médica</strong> y no sustituye el cálculo oficial del IMSS, de tu AFORE ni de CONSAR, ni la valoración de un profesional de la salud.</li>
              <li>Es una <strong>proyección educativa bajo supuestos declarados</strong>, no una promesa ni una predicción: el resultado cambia si cambian los precios, la medicina o tu salud.</li>
              <li><strong>Tus datos no se guardan:</strong> todo se calcula en tu dispositivo y desaparece al cerrar la página.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
