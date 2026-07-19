"use client";

/* Calculadora de elegibilidad de retiro — cuerpo portado TAL CUAL (D8) de la
   herramienta original: checklist de requisitos, gráfica "carrera de semanas"
   (línea de semanas proyectadas vs escalera del requisito legal), tooltip
   .rh-tip. No proyecta dinero. Motor en lib/pensiones/calc/calculos.ts. */

import { useEffect, useRef } from "react";
import { evaluaElegibilidad, type EntradaElegibilidad } from "@/lib/pensiones/calc/calculos";
import "./elegibilidad.css";

export function ElegibilidadCalculator() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const $ = (id: string) => root.querySelector<HTMLElement>("#" + id)!;
    const fmtN = (n: number) => Math.round(n).toLocaleString("es-MX");

    function leeInputs(): EntradaElegibilidad {
      return {
        edad: +($("edad") as HTMLInputElement).value,
        semanas: +($("semanas") as HTMLInputElement).value,
        pre97: root!.querySelector<HTMLInputElement>("input[name=pre97]:checked")!.value === "si",
        edadRetiro: +($("edadret") as HTMLInputElement).value,
        densidad: +($("densidad") as HTMLInputElement).value / 100,
      };
    }

    const RC = { W: 660, H: 250, m: { t: 16, r: 74, b: 26, l: 52 } };
    function drawRace(r: ReturnType<typeof evaluaElegibilidad>, inp: EntradaElegibilidad) {
      const svg = $("raceChart");
      const { W, H, m } = RC;
      const iw = W - m.l - m.r, ih = H - m.t - m.b;
      const tray = r.tray;
      const n = tray.length;
      if (n < 2) {
        svg.innerHTML = `<text class="axis-lbl" x="${W / 2}" y="${H / 2}" text-anchor="middle">Elige una edad de retiro mayor a tu edad actual para ver la trayectoria.</text>`;
        $("raceTable").innerHTML = ""; return;
      }
      const maxY = Math.max(1000, r.semanas, tray[n - 1].semanas, inp.semanas) * 1.12;
      const X = (i: number) => m.l + iw * (i / (n - 1));
      const Y = (v: number) => m.t + ih * (1 - v / maxY);
      const path = (key: "semanas") => tray.map((p, i) => (i ? "L" : "M") + X(i).toFixed(1) + "," + Y(p[key]).toFixed(1)).join("");
      let reqPath = "";
      tray.forEach((p, i) => {
        const x = X(i).toFixed(1), y = Y(p.req).toFixed(1);
        reqPath += i === 0 ? `M${x},${y}` : `H${x}`;
        if (i < n - 1 && tray[i + 1].req !== p.req) reqPath += `V${Y(tray[i + 1].req).toFixed(1)}`;
      });
      let grid = "", labs = "";
      for (const v of [500, 750, 1000]) {
        if (v > maxY) continue;
        const y = Y(v).toFixed(1);
        grid += `<line class="gridline" x1="${m.l}" y1="${y}" x2="${W - m.r}" y2="${y}"/>`;
        labs += `<text class="axis-lbl" x="${m.l - 6}" y="${+y + 3}" text-anchor="end">${fmtN(v)}</text>`;
      }
      const stepX = Math.max(1, Math.ceil(n / 7));
      for (let i = 0; i < n; i += stepX) {
        if (i > n - 1 - stepX * 0.65) continue;
        labs += `<text class="axis-lbl" x="${X(i).toFixed(1)}" y="${H - 8}" text-anchor="middle">${tray[i].edad}</text>`;
      }
      labs += `<text class="axis-lbl" x="${X(n - 1).toFixed(1)}" y="${H - 8}" text-anchor="middle" font-weight="700">${tray[n - 1].edad}</text>`;
      const endl =
        `<text class="endlab" x="${W - m.r + 6}" y="${(Y(tray[n - 1].semanas) + 3.5).toFixed(1)}" fill="var(--navy)">${fmtN(tray[n - 1].semanas)} sem</text>`
        + `<text class="endlab" x="${W - m.r + 6}" y="${(Y(tray[n - 1].req) + (Math.abs(Y(tray[n - 1].req) - Y(tray[n - 1].semanas)) < 12 ? 16 : 3.5)).toFixed(1)}" fill="var(--gold)">req ${fmtN(tray[n - 1].req)}</text>`;
      const l73line = inp.pre97 && 500 <= maxY
        ? `<line x1="${m.l}" y1="${Y(500)}" x2="${W - m.r}" y2="${Y(500)}" stroke="var(--text-secondary)" stroke-width="1.4" stroke-dasharray="2 5"/>` : "";
      let cruceMark = "";
      if (r.cruce && r.cruce.edad <= tray[n - 1].edad) {
        const i = r.cruce.edad - inp.edad;
        cruceMark = `<circle cx="${X(i)}" cy="${Y(tray[i].semanas)}" r="5" fill="var(--gold)" stroke="#fff" stroke-width="2"/>`;
      }
      svg.innerHTML = grid + labs + l73line
        + `<path d="${reqPath}" fill="none" stroke="var(--gold)" stroke-width="2" stroke-dasharray="6 5"/>`
        + `<path d="${path("semanas")}" fill="none" stroke="var(--navy)" stroke-width="2.6" stroke-linecap="round"/>`
        + `<circle cx="${X(n - 1)}" cy="${Y(tray[n - 1].semanas)}" r="4" fill="var(--navy)" stroke="#fff" stroke-width="1.5"/>`
        + cruceMark
        + `<line id="raceGuide" class="guide" y1="${m.t}" y2="${H - m.b}" x1="0" x2="0"/>`
        + endl
        + tray.map((p, i) => `<rect class="hitcol" x="${(X(i) - iw / (n - 1) / 2).toFixed(1)}" y="${m.t}" width="${(iw / (n - 1)).toFixed(1)}" height="${ih}" data-i="${i}"/>`).join("");
      const tip = $("raceTip"), guide = svg.querySelector<SVGLineElement>("#raceGuide")!;
      svg.querySelectorAll<SVGRectElement>(".hitcol").forEach((rect) => {
        const show = () => {
          const i = +rect.dataset.i!, p = tray[i];
          tip.innerHTML = `<span class="rh-tip__title">A los ${p.edad} años (${p.anio})</span>`
            + `<div class="rh-tip__detail">${fmtN(p.semanas)} <span class="dim">semanas proyectadas</span></div>`
            + `<div class="rh-tip__detail"><span class="dim">requisito de ese año: ${fmtN(p.req)}</span></div>`;
          const wrap = $("raceWrap"), sw = wrap.clientWidth / W;
          tip.style.left = X(i) * sw + "px"; tip.style.top = Y(p.semanas) * wrap.clientHeight / H + "px";
          tip.classList.add("is-visible");
          guide.setAttribute("x1", String(X(i))); guide.setAttribute("x2", String(X(i))); guide.classList.add("on");
        };
        const hide = () => { tip.classList.remove("is-visible"); guide.classList.remove("on"); };
        rect.addEventListener("mouseenter", show); rect.addEventListener("mouseleave", hide);
        rect.addEventListener("touchstart", (e) => { e.preventDefault(); show(); }, { passive: false });
      });
      $("raceTable").innerHTML = '<table><thead><tr><th>Edad</th><th>Año</th><th>Semanas proyectadas</th><th>Requisito del año</th></tr></thead><tbody>'
        + tray.map((p) => `<tr><td>${p.edad}</td><td>${p.anio}</td><td>${fmtN(p.semanas)}</td><td>${fmtN(p.req)}</td></tr>`).join("")
        + "</tbody></table>";
      ($("legL73") as HTMLElement).hidden = !inp.pre97;
    }

    function render() {
      const inp = leeInputs();
      $("edadretVal").textContent = inp.edadRetiro + " años";
      $("densidadVal").textContent = Math.round(inp.densidad * 100) + "%";
      ([["edadret", 60, 70], ["densidad", 0, 100]] as const).forEach(([id, min, max]) => {
        const el = $(id) as HTMLInputElement; el.style.setProperty("--pct", 100 * (+el.value - min) / (max - min) + "%");
      });
      if (!(inp.edad >= 18 && inp.edad <= inp.edadRetiro)) { $("bigStatus").textContent = "Revisa tu edad"; return; }
      const r = evaluaElegibilidad(inp);
      let cls: string, chip: string, big: string;
      if (r.elegible) { cls = "ok"; chip = "Cumplirías los requisitos"; big = `Elegible a los ${inp.edadRetiro} <small>(${r.tipo}, ${r.anioRetiro})</small>`; }
      else if (r.cruce && r.cruce.edad <= 70) { cls = "mid"; chip = "Próximo a cumplir"; big = `Los cumplirías a los ${r.cruce.edad} <small>(${r.cruce.anio})</small>`; }
      else { cls = "low"; chip = "No los alcanzarías así"; big = inp.densidad === 0 ? `Sin cotizar, faltan ${fmtN(r.faltan)} semanas` : `Con esa constancia, no antes de los 70`; }
      $("bigStatus").innerHTML = big;
      const sem = $("semaforo"); sem.className = "sem " + cls; sem.textContent = chip;
      $("heroSide").innerHTML =
        `<div class="row"><span>Semanas proyectadas a esa edad</span><b>${fmtN(r.semanas)}</b></div>`
        + `<div class="row"><span>Requisito en ${r.anioRetiro}</span><b>${fmtN(r.req)} semanas</b></div>`
        + `<div class="row"><span>${r.faltan > 0 ? "Te faltarían" : "Te sobrarían"}</span><b>${fmtN(Math.abs(r.semanas - r.req))} semanas</b></div>`
        + `<div class="row" style="border:none"><span>Tipo de pensión a esa edad</span><b>${r.tipo}</b></div>`;
      $("eligWarn").innerHTML = (!r.elegible && inp.densidad === 0)
        ? `<div class="note alert"><strong>Marcaste que ya no cotizas.</strong> Sin semanas nuevas, el requisito no se alcanza por el paso del tiempo: las semanas se acumulan solo cotizando (reingreso al régimen obligatorio o continuación voluntaria). Esta calculadora no recomienda un camino; muestra la regla.</div>` : "";
      const reqRow = (okState: boolean | "casi", q: string, hint: string, st: string) => {
        const mk = okState === true ? "si" : (okState === "casi" ? "casi" : "no");
        const sym = okState === true ? "✓" : (okState === "casi" ? "~" : "✗");
        return `<div class="req"><span class="mark ${mk}">${sym}</span><span class="q">${q}<span class="hint">${hint}</span></span><span class="st">${st}</span></div>`;
      };
      let rows = reqRow(r.cumpleEdad, "Edad mínima", `60 cesantía · 65 vejez (LSS arts. 154/162)`, `${inp.edadRetiro} años`)
        + reqRow(r.cumpleSemanas ? true : (r.cruce && r.cruce.edad <= 70 ? "casi" : false), `Semanas de cotización (Ley 97)`, `${fmtN(r.req)} en ${r.anioRetiro} — el requisito sube +25/año hasta 1,000 en 2031`, `${fmtN(r.semanas)} proyectadas`);
      if (inp.pre97) rows += reqRow(r.l73.cumple, "Semanas Ley 73 (tu derecho de transición)", "500 semanas (LSS-1973); al pensionarte eliges el esquema que más te convenga", r.l73.cumple ? `${fmtN(r.semanas)} ≥ 500` : `faltan ${fmtN(r.l73.faltan)}`);
      $("reqs").innerHTML = rows;
      drawRace(r, inp);
      $("l73Box").innerHTML = (inp.pre97 && r.l73.cumple) ? `<div class="note">
        <strong>Generación de transición:</strong> con ${fmtN(r.semanas)} semanas proyectadas superas las 500 de la Ley 73, así que a la edad elegida tendrías <strong>dos cálculos posibles</strong> y el derecho de quedarte con el mayor (transitorio Tercero, LSS 1997). El IMSS está obligado a calcularte ambos. La Ley 73 además pide la <em>baja del régimen</em> para cesantía — trámite que aquí no se modela. Compara montos en la <a href="/pensiones/calculadoras/pension">calculadora de pensión</a>.</div>` : "";
      $("pmgNote").innerHTML = r.elegible ? `<div class="note">Cumpliendo edad y semanas también queda asegurado el piso de la <strong>pensión garantizada</strong> (LSS art. 170): si tu saldo diera una pensión menor al mínimo oficial para tu caso, el Estado cubre la diferencia. El monto es tema de la <a href="/pensiones/calculadoras/pension">calculadora de pensión</a>.</div>` : "";
      let msg: string;
      if (r.elegible) msg = `A los ${inp.edadRetiro} años (${r.anioRetiro}) cumplirías los dos requisitos de la Ley 97 para pensión de ${r.tipo}: la edad y las ${fmtN(r.req)} semanas que ese año exige (proyectas ${fmtN(r.semanas)}, con la constancia que elegiste). El requisito de semanas sube cada año hasta 2031 — por eso la línea dorada de la gráfica se mueve.`;
      else if (r.cruce && r.cruce.edad <= 70) msg = `A los ${inp.edadRetiro} no llegarías: en ${r.anioRetiro} la ley pedirá ${fmtN(r.req)} semanas y tu proyección alcanza ${fmtN(r.semanas)} (faltan ${fmtN(r.faltan)}). Manteniendo tu constancia de ${Math.round(inp.densidad * 100)}%, las alcanzarías a los ${r.cruce.edad} años (${r.cruce.anio}). Mueve la constancia o la edad para ver cómo cambia el cruce — la calculadora muestra la regla, no te dice cuándo retirarte.`;
      else msg = `Con estos datos el requisito no se alcanzaría a los 70: en ${r.anioRetiro} se piden ${fmtN(r.req)} semanas y tu proyección llega a ${fmtN(r.semanas)}. ${inp.densidad === 0 ? "Sin cotización nueva las semanas no crecen." : "Sube la constancia de cotización para ver a qué edad cruzarías el requisito."} Tu cifra real de semanas está en la constancia del IMSS — es la fuente que manda.`;
      if (inp.pre97 && !r.l73.cumple && r.semanas < 500) msg += ` Sobre tu derecho de transición: aún no llegas a las 500 semanas de la Ley 73 (faltan ${fmtN(r.l73.faltan)}).`;
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
    return () => { handlers.forEach(([el, h]) => el.removeEventListener("input", h)); removeEventListener("resize", onResize); };
  }, []);

  return (
    <div className="calc-root" ref={rootRef}>
      <link rel="stylesheet" href="/pensiones/sar-29/vendor/fonts.css" precedence="default" />
      <div className="wrap">
        <header className="top">
          <div>
            <div className="kicker">Datos México · Calculadoras</div>
            <h1>¿Ya cumples los requisitos para pensionarte?</h1>
            <p className="sub">La ley pide <strong>edad</strong> y <strong>semanas de cotización</strong> — y el requisito de semanas sube cada año hasta 2031. Esta herramienta te muestra si los cumplirías a la edad que eliges y, si no, <strong>cuándo</strong> los alcanzarías. No proyecta dinero: para eso está la calculadora de pensión.</p>
          </div>
          <div className="hero-meta">Vigencia de supuestos: <b>2026</b><br />Base: documento actuarial v1.0 · reglas LSS arts. 154/162/décimo transitorio<br />Perímetro: trabajadores IMSS</div>
        </header>
        <div className="calc-grid">
          <aside className="panel" id="f">
            <span className="step">Paso 1 · Cuéntanos dónde estás</span>
            <h2>Tus datos</h2>
            <div className="fgrid">
              <div className="field"><label htmlFor="edad">Edad actual</label><input type="number" id="edad" min={18} max={69} defaultValue={55} /></div>
              <div className="field"><label htmlFor="semanas">Semanas cotizadas <span className="hint">tu constancia IMSS manda</span></label><input type="number" id="semanas" min={0} max={3000} defaultValue={900} /></div>
              <div className="field full"><label>¿Cotizaste antes de julio de 1997?</label>
                <div className="radio-row" role="radiogroup">
                  <label><input type="radio" name="pre97" value="no" defaultChecked /> No</label>
                  <label><input type="radio" name="pre97" value="si" /> Sí (generación de transición)</label>
                </div></div>
            </div>
            <div className="slider-block">
              <div className="slider-head"><label htmlFor="edadret">Edad a la que quisieras retirarte</label><span className="val" id="edadretVal">65 años</span></div>
              <input type="range" id="edadret" min={60} max={70} step={1} defaultValue={65} aria-describedby="edadretVal" />
              <div className="slider-scale"><span>60 (cesantía)</span><span>65 (vejez)</span><span>70</span></div>
            </div>
            <div className="slider-block">
              <div className="slider-head"><label htmlFor="densidad">Constancia de cotización futura <span className="hint">parte del tiempo que seguirás cotizando</span></label><span className="val" id="densidadVal">90%</span></div>
              <input type="range" id="densidad" min={0} max={100} step={5} defaultValue={90} aria-describedby="densidadVal" />
              <div className="slider-scale"><span>ya no cotizo 0</span><span>mixto 60</span><span>continuo 90</span></div>
            </div>
          </aside>
          <section className="results">
            <div className="card hero-res">
              <div>
                <span className="step">Paso 2 · Tu estatus</span>
                <div className="lbl" id="bigLbl">Con tus datos, al retirarte:</div>
                <div className="big elig" id="bigStatus">—</div>
                <span className="sem mid" id="semaforo">—</span>
              </div>
              <div className="hero-side" id="heroSide"></div>
            </div>
            <div id="eligWarn"></div>
            <div className="card">
              <span className="step">Los requisitos, uno por uno</span>
              <h3>Lo que la ley pide para pensionarte <span className="hint">— a la edad que elegiste</span></h3>
              <div className="reqs" id="reqs"></div>
            </div>
            <div className="card">
              <span className="step">La carrera de tus semanas</span>
              <h3>Tus semanas proyectadas frente al requisito que sube <span className="hint">— +25 por año hasta 1,000 en 2031</span></h3>
              <div className="viz-wrap" id="raceWrap">
                <svg id="raceChart" viewBox="0 0 660 250" role="img" aria-label="Semanas cotizadas proyectadas por edad frente al requisito legal del año correspondiente"></svg>
                <div className="rh-tip" id="raceTip" aria-hidden="true"></div>
              </div>
              <div className="viz-legend">
                <span style={{ color: "var(--navy)" }}><i style={{ borderColor: "var(--navy)" }}></i>tus semanas proyectadas</span>
                <span><i style={{ borderColor: "var(--gold)", borderTopStyle: "dashed" }}></i>requisito del año (Ley 97)</span>
                <span id="legL73" hidden><i style={{ borderColor: "var(--text-secondary)", borderTopStyle: "dotted" }}></i>500 semanas (Ley 73)</span>
              </div>
              <details style={{ margin: "10px 0 0", border: "none", background: "none" }}><summary style={{ padding: "4px 0", fontSize: "12px" }}>Ver los datos de esta gráfica</summary><div className="det-body scroll" id="raceTable" style={{ padding: "6px 0 2px" }}></div></details>
            </div>
            <div id="l73Box"></div>
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
                <a href="/pensiones/calculadoras/pension">¿Y de cuánto sería tu pensión? (calculadora de pensión)</a>
                <a href="/pensiones/calculadoras/comparador">¿Antes, a tiempo o después? (comparador de escenarios)</a>
                <a href="#supuestos">Metodología y supuestos</a>
              </div>
            </div>
          </section>
        </div>
        <div className="lower">
          <h2 id="supuestos" style={{ fontFamily: "Merriweather,Georgia,serif", color: "var(--navy)", fontSize: "19px", margin: "0 0 4px" }}>Metodología y supuestos <span className="hint">— vigencia: 2026 · documento base actuarial v1.0</span></h2>
          <details><summary><span className="tag tR">R</span> Reglas de ley que aplica el cálculo (fuentes oficiales versionadas)</summary><div className="det-body">
            <ul>
              <li><strong>Edad (Ley 97):</strong> cesantía en edad avanzada desde los <strong>60</strong> años (LSS art. 154); vejez desde los <strong>65</strong> (art. 162).</li>
              <li><strong>Semanas (Ley 97):</strong> el requisito está en transición — 750 semanas en 2021, <strong>+25 por año</strong> hasta llegar a 1,000 en 2031 (decreto DOF 16-dic-2020, transitorio Cuarto). El cálculo usa el requisito <em>del año en que te retirarías</em>: en <strong>2026 son 875</strong>. Esta es la parte que más confunde — y la razón de la línea dorada móvil de la gráfica.</li>
              <li><strong>Ley 73 (si cotizaste antes del 1-jul-1997):</strong> como generación de transición puedes elegir, al pensionarte, entre Ley 73 y Ley 97 (LSS 1997, transitorio Tercero); la Ley 73 pide <strong>500 semanas</strong> y la misma edad (LSS-1973, arts. 137-138 y 145). El requisito de <em>baja del régimen</em> para cesantía (art. 145) no se modela aquí; se declara.</li>
              <li><strong>Pensión garantizada:</strong> con 60+ años y las semanas en transición cumplidas, el Estado garantiza un mínimo aunque tu saldo sea bajo (LSS art. 170) — esta calculadora solo lo señala; el monto es tema de la calculadora de pensión.</li>
              <li><strong>Perímetro:</strong> trabajadores IMSS. ISSSTE y pensión de Bienestar: fase posterior declarada, no se calculan a medias.</li>
            </ul></div></details>
          <details><summary><span className="tag tS">S</span> Supuestos declarados <span className="hint">— escenario ilustrativo</span></summary><div className="det-body">
            <ul>
              <li><strong>Constancia de cotización futura:</strong> la eliges tú (presets ilustrativos 90/60/40 — resolución metodológica, no validación actuarial; 0 si ya no cotizas). Tus semanas futuras = 52 × años restantes × constancia.</li>
              <li><strong>"Próximo a cumplir":</strong> etiqueta metodológica — no cumples a la edad elegida, pero con tu misma constancia los requisitos se alcanzarían a más tardar a los 70. Umbral público y discutible.</li>
              <li><strong>Sin dinero:</strong> esta calculadora no proyecta saldos ni pensiones (no usa rendimientos ni tablas de mortalidad); habla exclusivamente de <em>requisitos</em>. Para montos, la calculadora de pensión estimada.</li>
              <li><strong>Las semanas que escribes son la base de todo:</strong> la cifra oficial es la de tu <em>constancia de semanas cotizadas</em> del IMSS (se descarga en línea); si tu dato real difiere, el resultado cambia.</li>
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
