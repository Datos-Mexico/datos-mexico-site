"use client";

/* Calculadora de gasto de vida en retiro — cuerpo portado TAL CUAL (D8):
   sliders por rubro construidos desde la referencia ENIGH 2024, canasta
   comparada con marca de referencia, bloque horizonte, cobertura opcional.
   Referencia [V] ENIGH 2024 + INPC. Motor en lib/pensiones/calc/calculos-c. */

import { useEffect, useRef } from "react";
import { GV, referenciaMensualGasto, calculaGastoVida, type EntradaGastoVida } from "@/lib/pensiones/calc/calculos-c";
import "./gasto-vida.css";

export function GastoVidaCalculator() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const $ = (id: string) => root.querySelector<HTMLElement>("#" + id)!;
    const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fmt = (n: number) => "$" + Math.round(n).toLocaleString("es-MX");
    const fmtM = (n: number) => n >= 1e6 ? "$" + (n / 1e6).toFixed(1) + " millones" : fmt(n);
    const RUBROS = [
      { k: "alimentos", lbl: "Alimentación y bebidas", max: 20000, step: 100, hint: "" },
      { k: "transporte", lbl: "Transporte y comunicaciones", max: 10000, step: 100, hint: "" },
      { k: "vivienda", lbl: "Vivienda y servicios", max: 10000, step: 100, hint: "luz, agua, gas — sin renta imputada" },
      { k: "limpieza", lbl: "Limpieza y enseres del hogar", max: 6000, step: 50, hint: "" },
      { k: "personales", lbl: "Cuidados personales", max: 6000, step: 50, hint: "" },
      { k: "salud", lbl: "Cuidados de la salud", max: 8000, step: 50, hint: "gasto de bolsillo" },
      { k: "educacion", lbl: "Educación y esparcimiento", max: 8000, step: 50, hint: "" },
      { k: "vestido", lbl: "Vestido y calzado", max: 4000, step: 50, hint: "" },
      { k: "transferencias", lbl: "Apoyos a otros hogares", max: 5000, step: 50, hint: "" },
    ];
    const REF = referenciaMensualGasto();

    $("sliders").innerHTML = RUBROS.map((r) => {
      const v = Math.round(REF[r.k] / r.step) * r.step;
      return `<div class="slider-block">
        <div class="slider-head"><label for="s_${r.k}">${r.lbl}${r.hint ? ` <span class="hint">${r.hint}</span>` : ""}</label><span class="val" id="s_${r.k}Val">${fmt(v)}</span></div>
        <input type="range" id="s_${r.k}" min="0" max="${r.max}" step="${r.step}" value="${v}" aria-describedby="s_${r.k}Val">
        <div class="ref-mini">referencia 65+: ${fmt(REF[r.k])}</div>
      </div>`;
    }).join("");

    function leeInputs(): EntradaGastoVida {
      const rubros: Record<string, number> = {};
      RUBROS.forEach((r) => (rubros[r.k] = +($("s_" + r.k) as HTMLInputElement).value));
      return { rubros, sexo: ($("sexo") as unknown as HTMLSelectElement).value as "H" | "M", edadRetiro: +($("edadret") as unknown as HTMLSelectElement).value, ingreso: +($("ingreso") as HTMLInputElement).value };
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
      RUBROS.forEach((r) => {
        const el = $("s_" + r.k) as HTMLInputElement;
        $("s_" + r.k + "Val").textContent = fmt(+el.value);
        el.style.setProperty("--pct", 100 * +el.value / r.max + "%");
      });
      const res = calculaGastoVida(inp);
      tween(prevBig, res.mensual, 420, (k) => { $("bigTotal").innerHTML = fmt(lerp(prevBig, res.mensual, k)) + "<small> /mes</small>"; });
      prevBig = res.mensual;
      $("vsRef").textContent = "≈ " + res.vsRef.toFixed(2).replace(".", ",") + "× el hogar de referencia 65+";
      $("heroSide").innerHTML =
        `<div class="row"><span>Al año</span><b>${fmt(res.anual)}</b></div>`
        + `<div class="row"><span>Hogar de referencia 65+ (ENIGH)</span><b>${fmt(res.refTotal)}</b></div>`
        + `<div class="row"><span>Referencia por integrante (2.8)</span><b>${fmt(res.refTotal / GV.ENIGH_TAM_HOGAR)}</b></div>`
        + `<div class="row" style="border:none"><span>Horizonte tras retirarte (${inp.sexo === "H" ? "hombre" : "mujer"}, ${inp.edadRetiro})</span><b>≈ ${res.ex.toFixed(1)} años</b></div>`;
      const maxV = Math.max(...RUBROS.map((r) => Math.max(inp.rubros[r.k], REF[r.k]))) * 1.1;
      $("canasta").innerHTML = RUBROS.map((r) => {
        const v = inp.rubros[r.k], ref = REF[r.k];
        return `<div class="cb-row" tabindex="0" data-k="${r.k}" aria-label="${r.lbl}: tu presupuesto ${fmt(v)}, referencia ${fmt(ref)}">
          <div class="c-lbl">${r.lbl}</div>
          <div class="cb-track">
            <div class="cb-fill" style="width:${(100 * v / maxV).toFixed(2)}%"></div>
            <div class="cb-ref" style="left:${(100 * ref / maxV).toFixed(2)}%"></div>
          </div>
          <div class="cb-val">${fmt(v)}</div>
        </div>`;
      }).join("");
      const tip = $("cbTip"), wrap = $("cbWrap");
      root!.querySelectorAll<HTMLElement>(".cb-row").forEach((row) => {
        const r = RUBROS.find((x) => x.k === row.dataset.k)!;
        const show = () => {
          const v = inp.rubros[r.k], ref = REF[r.k];
          const d = ref > 0 ? Math.round(100 * (v - ref) / ref) : 0;
          tip.innerHTML = `<span class="rh-tip__title">${r.lbl}</span>`
            + `<div class="rh-tip__detail">${fmt(v)} <span class="dim">tu presupuesto</span></div>`
            + `<div class="rh-tip__detail">${fmt(ref)} <span class="dim">referencia 65+ (${d >= 0 ? "+" : ""}${d}%)</span></div>`;
          const rr = row.getBoundingClientRect(), wr = wrap.getBoundingClientRect();
          tip.style.left = rr.left - wr.left + rr.width * 0.55 + "px";
          tip.style.top = rr.top - wr.top + 2 + "px";
          tip.classList.add("is-visible");
        };
        const hide = () => tip.classList.remove("is-visible");
        row.addEventListener("mouseenter", show); row.addEventListener("mouseleave", hide);
        row.addEventListener("focus", show); row.addEventListener("blur", hide);
      });
      $("horizonteBox").innerHTML = `<span class="step">Ese mes, multiplicado por los años</span>
        <h3>Tu retiro completo, en pesos de hoy</h3>
        <div class="bigcap">${fmtM(res.acumulado)} <span class="hint">a lo largo de ≈ ${res.ex.toFixed(1)} años de esperanza de vida</span></div>
        <p>Esperanza de vida <em>condicionada a llegar a los ${inp.edadRetiro}</em> según EMSSA-09 (${inp.sexo === "H" ? "hombres" : "mujeres"}): no es la esperanza al nacer. Es un promedio — alrededor de la mitad de las personas vive más:</p>
        <div class="hz-range">
          <span>si vives 5 años más: <b>${fmtM(res.acumuladoMas5)}</b></span>
          <span>por año: <b>${fmt(res.anual)}</b></span>
        </div>`;
      if (res.cobertura !== null) {
        $("cobBox").style.display = "";
        const cls = res.cobertura >= 1 ? "ok" : (res.cobertura >= 0.7 ? "mid" : "low");
        const txt = res.cobertura >= 1 ? "Ingreso cubre tu presupuesto" : (res.cobertura >= 0.7 ? "Cobertura parcial" : "Cobertura baja");
        $("cobTitle").textContent = `Tu ingreso esperado cubriría ≈ ${Math.round(100 * res.cobertura)}% de este presupuesto`;
        $("cobTrack").innerHTML = `<div class="cob-fill ${cls}" style="width:${(100 * Math.min(res.cobertura, 1.3) / 1.3).toFixed(1)}%;background:${cls === "ok" ? "var(--ok)" : cls === "mid" ? "var(--gold)" : "var(--low)"}"></div>
          <div class="cob-mark" style="left:${(100 / 1.3).toFixed(1)}%"></div>`;
        $("cobSem").innerHTML = `<span class="sem ${cls}">${txt}</span> <span class="hint">umbrales metodológicos: 100%+ / 70-100% / &lt;70%</span>`;
      } else {
        $("cobBox").style.display = "none";
      }
      const rel = res.vsRef >= 1.15 ? "por encima de" : (res.vsRef <= 0.85 ? "por debajo de" : "cerca de");
      $("interp").textContent = `Tu presupuesto suma ${fmt(res.mensual)} al mes para el hogar — ${rel} lo que los hogares con jefe(a) 65+ gastan en promedio (${fmt(res.refTotal)}, ENIGH 2024). A lo largo de ≈${res.ex.toFixed(1)} años de esperanza de vida tras retirarte a los ${inp.edadRetiro}, ese ritmo de vida acumula ${fmtM(res.acumulado)} en pesos de hoy${res.cobertura !== null ? `; tu ingreso esperado cubriría ≈${Math.round(100 * res.cobertura)}% de cada mes` : ""}. La referencia describe lo que los hogares gastan, no lo que deberías gastar: mueve cada rubro a la vida que tú quieres — la calculadora muestra cuánto suma, no te dice cómo vivir.`;
      $("refTable").innerHTML = '<table><thead><tr><th>Rubro</th><th>Trimestral 2024 (hogar 65+)</th><th>Mensual en pesos 2026 (factor INPC ' + GV.INPC_FACTOR_2024_2026.toFixed(4) + ')</th></tr></thead><tbody>'
        + RUBROS.map((r) => `<tr><td>${r.lbl}</td><td>${fmt(GV.ENIGH_65MAS_TRIM[r.k])}</td><td>${fmt(REF[r.k])}</td></tr>`).join("")
        + `<tr><td><b>Total</b></td><td><b>${fmt(GV.ENIGH_TOTAL_TRIM)}</b></td><td><b>${fmt(res.refTotal)}</b></td></tr></tbody></table>`;
    }
    const resetBtn = $("resetBtn");
    const onReset = () => { RUBROS.forEach((r) => { ($("s_" + r.k) as HTMLInputElement).value = String(Math.round(REF[r.k] / r.step) * r.step); }); render(); };
    resetBtn.addEventListener("click", onReset);
    const panel = $("f");
    const onInput = (e: Event) => {
      render();
      const t = e.target as HTMLInputElement;
      if (t.type === "range") {
        const v = root!.querySelector<HTMLElement>("#" + t.id + "Val");
        if (v) { v.classList.add("bump"); clearTimeout((v as unknown as { _t: number })._t); (v as unknown as { _t: number })._t = window.setTimeout(() => v.classList.remove("bump"), 350); }
      }
    };
    panel.addEventListener("input", onInput);
    const onResize = () => render();
    addEventListener("resize", onResize);
    render();
    return () => { resetBtn.removeEventListener("click", onReset); panel.removeEventListener("input", onInput); removeEventListener("resize", onResize); if (animState) cancelAnimationFrame(animState); };
  }, []);

  return (
    <div className="calc-root" ref={rootRef}>
      <link rel="stylesheet" href="/pensiones/sar-29/vendor/fonts.css" precedence="default" />
      <div className="wrap">
        <header className="top">
          <div>
            <div className="kicker">Datos México · Calculadoras</div>
            <h1>¿Cuánto cuesta al mes la vida que quieres en tu retiro?</h1>
            <p className="sub">Arma tu presupuesto rubro por rubro partiendo de lo que <strong>los hogares mexicanos 65+ realmente gastan</strong> (ENIGH 2024, INEGI) y mira cuánto suma tu mes — y tu retiro completo. Esto informa — el presupuesto es tuyo.</p>
          </div>
          <div className="hero-meta">Vigencia de supuestos: <b>2026</b><br />Referencia: ENIGH 2024 (INEGI) · por hogar<br />Horizonte: EMSSA-09 (esperanza condicionada)</div>
        </header>
        <div className="calc-grid">
          <aside className="panel" id="f">
            <span className="step">Paso 1 · Tu punto de partida</span>
            <h2>Tus datos</h2>
            <div className="fgrid">
              <div className="field"><label htmlFor="sexo">Sexo <span className="hint">(horizonte EMSSA-09)</span></label>
                <select id="sexo" defaultValue="H"><option value="H">Hombre</option><option value="M">Mujer</option></select></div>
              <div className="field"><label htmlFor="edadret">Edad de retiro</label>
                <select id="edadret" defaultValue="65"><option>60</option><option>61</option><option>62</option><option>63</option><option>64</option><option>65</option><option>66</option><option>67</option><option>68</option><option>69</option><option>70</option></select></div>
              <div className="field full"><label htmlFor="ingreso">Ingreso mensual esperado en retiro <span className="hint">opcional (0 = omitir) — pensión + otros</span></label><input type="number" id="ingreso" min={0} step={500} defaultValue={0} /></div>
            </div>
            <div className="canasta-head">
              <span className="step">Paso 1b · Tu canasta mensual</span>
              <h2>Rubro por rubro <button className="reset" id="resetBtn" type="button">restablecer a la referencia</button></h2>
            </div>
            <div id="sliders"></div>
          </aside>
          <section className="results">
            <div className="card hero-res">
              <div>
                <span className="step">Paso 2 · Tu mes de retiro</span>
                <div className="lbl">Tu presupuesto mensual armado — en pesos de hoy</div>
                <div className="big" id="bigTotal">$0<small> /mes</small></div>
                <span className="chip" id="vsRef">—</span>
              </div>
              <div className="hero-side" id="heroSide"></div>
            </div>
            <div className="card">
              <span className="step">Tu canasta frente a la referencia</span>
              <h3>Lo que elegiste en cada rubro <span className="hint">— la marca dorada es el hogar de referencia 65+ (ENIGH 2024)</span></h3>
              <div className="viz-wrap" id="cbWrap">
                <div id="canasta"></div>
                <div className="rh-tip" id="cbTip" aria-hidden="true"></div>
              </div>
              <div className="viz-legend">
                <span><i className="sq"></i>tu presupuesto</span>
                <span><i className="ln"></i>hogar de referencia 65+ (ENIGH 2024)</span>
              </div>
            </div>
            <div className="card horizonte" id="horizonteBox"></div>
            <div className="card" id="cobBox" style={{ display: "none" }}>
              <span className="step">Tu presupuesto frente a tu ingreso esperado</span>
              <h3 id="cobTitle">Cobertura</h3>
              <div className="cob-track" id="cobTrack"></div>
              <div id="cobSem"></div>
              <p className="hint" style={{ marginTop: "8px" }}>Para el cálculo completo con tu pensión proyectada y tres escenarios, usa la <a href="/pensiones/calculadoras/brecha" style={{ color: "var(--navy)" }}>calculadora de brecha</a>.</p>
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
                <a href="/pensiones/calculadoras/brecha">¿Tu plan sostiene este presupuesto? (calculadora de brecha)</a>
                <a href="/pensiones/calculadoras/gastos-medicos">El rubro que crece con la edad (gastos médicos)</a>
                <a href="#supuestos">Metodología y supuestos</a>
              </div>
            </div>
          </section>
        </div>
        <div className="lower">
          <h2 id="supuestos" style={{ fontFamily: "Merriweather,Georgia,serif", color: "var(--navy)", fontSize: "19px", margin: "0 0 4px" }}>Metodología y supuestos <span className="hint">— vigencia: 2026 · documento base actuarial v1.0</span></h2>
          <details><summary><span className="tag tV">V</span> Datos oficiales usados</summary><div className="det-body">
            <ul>
              <li><strong>Gasto de referencia:</strong> ENIGH 2024 (INEGI), gasto corriente monetario trimestral promedio por hogar con jefe(a) de 65 años o más — cálculo propio con los microdatos oficiales (concentradohogar, ponderado por factor de expansión), validado contra los cuadros publicados. Es un dato <em>verificado</em>, no un escenario.</li>
              <li><strong>Actualización a pesos de 2026:</strong> factor INPC general (INEGI, serie 865586) del periodo de levantamiento de la ENIGH a mayo de 2026 = <strong>1.0655</strong>. Dato verificado.</li>
              <li><strong>Horizonte:</strong> esperanza de vida completa <em>condicionada a la edad alcanzada</em>, tablas EMSSA-09 por sexo (CNSF, DOF 14-ago-2009). Nunca la esperanza al nacer.</li>
            </ul>
            <div className="scroll" id="refTable"></div>
          </div></details>
          <details><summary><span className="tag tS">S</span> Método declarado</summary><div className="det-body">
            <ul>
              <li><strong>El presupuesto lo armas tú:</strong> cada rubro parte de la referencia ENIGH pero lo mueves a tu vida. La referencia describe lo que los hogares gastan, no lo que deberías gastar.</li>
              <li><strong>Referencia por hogar:</strong> las cifras son por hogar (tamaño medio 2.8 integrantes en los hogares 65+); se muestra también el equivalente por integrante como orientación.</li>
              <li><strong>Sin proyección financiera:</strong> el acumulado es tu mes × 12 × años de esperanza de vida, en pesos de hoy — una multiplicación informativa, no una proyección con rendimientos.</li>
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
