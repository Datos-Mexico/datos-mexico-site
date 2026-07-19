"use client";

/* Journey "Tu retiro" — wizard de una sola página portado TAL CUAL (D8) del
   original (journey/index.html + journey.v2.js): 5 pantallas (intro → test 4
   preguntas → enganche → calculadora ilustrativa → resultado), transiciones
   secuenciadas, personalización por etapa/pregunta/situación laboral, banner
   ilustrativo, semáforo, anclas al sistema, estado en sessionStorage + hash.
   Copy en lib/pensiones/journey/contenido.ts.

   Excepción 5.5 (veracidad, única desviación de D8 en esta fase): NO se portan
   los cards de "curso recomendado" y "recurso descargable" (placeholders de
   un producto de acompañamiento que no existe ni existirá en el observatorio), sus botones de acción, ni el modal de honestidad que existía
   solo para explicar esos placeholders. La pantalla de resultado se ajusta
   para que la ausencia no deje hueco: el "siguiente paso" apunta directo a la
   calculadora publicada más relevante para la etapa (producto real). */

import { useEffect, useRef } from "react";
import {
  SEGMENTS, WORRIES, WORK_CONTEXTS, READING, pickAnchorsFor,
  PREFILL_AGE, PREFILL_YEARS, CALC_POR_ETAPA, CALC_EXTRA_POR_ETAPA,
} from "@/lib/pensiones/journey/contenido";
import "./journey.css";

type JState = { age?: string; work?: string; worry?: string; years?: string; segment?: string; calc?: { inputs: CalcInputs; sim: Sim } };
type CalcInputs = { age: number; retireAge: number; salary: number; years: number; law: string };
type Sim = { pension: number; need: number; coverage: number; status: string; label: string };

export function JourneyTuRetiro() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const $ = (id: string) => root.querySelector<HTMLElement>("#" + id);
    const STATE_KEY = "datosmexico.journey.v1";
    const loadState = (): JState => { try { const raw = sessionStorage.getItem(STATE_KEY); return raw ? JSON.parse(raw) : {}; } catch { return {}; } };
    const saveState = (s: JState) => { try { sessionStorage.setItem(STATE_KEY, JSON.stringify(s)); } catch { /* opcional */ } };
    let state = loadState();

    const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const SCREENS = ["intro", "test", "enganche", "calc", "result"];
    const SCREEN_TRANSITION_MS = prefersReducedMotion ? 0 : 280;

    function showScreen(name: string) {
      if (!SCREENS.includes(name)) return;
      const current = root!.querySelector(".j-screen--active");
      const next = root!.querySelector(`.j-screen[data-screen="${name}"]`);
      if (!next || current === next) {
        if (next) root!.querySelectorAll(".j-screen").forEach((el) => el.classList.toggle("j-screen--active", el === next));
        history.replaceState(null, "", "#" + name);
        return;
      }
      if (current && SCREEN_TRANSITION_MS > 0) {
        current.classList.add("j-screen--leaving");
        setTimeout(() => {
          current.classList.remove("j-screen--active", "j-screen--leaving");
          next.classList.add("j-screen--active");
          window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "instant" : "smooth" });
        }, SCREEN_TRANSITION_MS);
      } else {
        if (current) current.classList.remove("j-screen--active", "j-screen--leaving");
        next.classList.add("j-screen--active");
        window.scrollTo({ top: 0, behavior: "instant" });
      }
      history.replaceState(null, "", "#" + name);
    }

    const onGoClick = (e: Event) => {
      const target = (e.target as HTMLElement).closest("[data-go]") as HTMLElement | null;
      if (!target || !root!.contains(target)) return;
      const screen = target.dataset.go!;
      if (screen === "enganche") renderEnganche();
      else if (screen === "result") return;
      showScreen(screen);
    };
    document.addEventListener("click", onGoClick);

    const totalQuestions = 4;
    let currentQuestion: number | "resolved" = 1;
    function showQuestion(n: number | "resolved") {
      root!.querySelectorAll(".j-question").forEach((q) => {
        const el = q as HTMLElement;
        el.classList.toggle("is-active", el.dataset.q === String(n) || (n === "resolved" && el.dataset.q === "resolved"));
      });
      currentQuestion = n === "resolved" ? currentQuestion : n;
    }
    const optHandlers: Array<[Element, () => void]> = [];
    root.querySelectorAll(".j-option").forEach((optEl) => {
      const opt = optEl as HTMLElement;
      const h = () => {
        const key = opt.dataset.key!, value = opt.dataset.value!;
        opt.parentElement!.querySelectorAll(".j-option").forEach((s) => s.classList.remove("is-selected"));
        opt.classList.add("is-selected");
        (state as Record<string, string>)[key] = value;
        saveState(state);
        setTimeout(() => {
          if (typeof currentQuestion === "number" && currentQuestion < totalQuestions) showQuestion(currentQuestion + 1);
          else { resolveSegment(); showQuestion("resolved"); }
        }, 280);
      };
      opt.addEventListener("click", h); optHandlers.push([opt, h]);
    });

    function resolveSegment() {
      const seg = SEGMENTS[state.age || "lt35"] || SEGMENTS.lt35;
      state.segment = seg.key; saveState(state);
      $("jSegmentName")!.textContent = seg.name;
      $("jSegmentDesc")!.textContent = seg.desc;
      const worryEl = $("jSegmentWorry");
      const worry = state.worry ? WORRIES[state.worry] : undefined;
      if (worryEl) {
        if (worry) { worryEl.textContent = "Y nos dijiste que tu pregunta principal es " + worry.shortLabel + ". Vamos en esa dirección."; worryEl.hidden = false; }
        else worryEl.hidden = true;
      }
    }
    function renderEnganche() {
      const seg = SEGMENTS[state.age || "lt35"] || SEGMENTS.lt35;
      $("jEngancheTitle")!.textContent = seg.enganche.title;
      $("jEngancheBody")!.textContent = seg.enganche.body;
      const worryEl = $("jEngancheWorry");
      const worry = state.worry ? WORRIES[state.worry] : undefined;
      if (worryEl) {
        if (worry) { worryEl.textContent = worry.acknowledge; worryEl.hidden = false; }
        else worryEl.hidden = true;
      }
    }
    function renderCalcFraming() {
      const el = $("jCalcFraming"); if (!el) return;
      const ctx = state.work ? WORK_CONTEXTS[state.work] : undefined;
      if (ctx) { el.textContent = ctx.calcFraming; el.hidden = false; } else el.hidden = true;
    }
    function prefillCalc() {
      const ageInput = $("jAge") as HTMLInputElement, yearsInput = $("jYears") as HTMLInputElement;
      if (state.age && !ageInput.value) ageInput.value = String(PREFILL_AGE[state.age] || "");
      if (state.years && !yearsInput.value) yearsInput.value = String(PREFILL_YEARS[state.years] || "");
      renderCalcFraming();
    }
    const observer = new MutationObserver(() => {
      const calc = root!.querySelector('.j-screen[data-screen="calc"]');
      if (calc && calc.classList.contains("j-screen--active")) prefillCalc();
    });
    observer.observe(root, { attributes: true, subtree: true, attributeFilter: ["class"] });

    function simulatePension(inputs: CalcInputs): Sim {
      const { age, retireAge, salary, years, law } = inputs;
      let factor: number;
      if (law === "ley73") factor = 0.30 + Math.min(years / 30 * 0.20, 0.20);
      else if (law === "ley97") factor = 0.22 + Math.min(years / 30 * 0.18, 0.18);
      else factor = 0.26 + Math.min(years / 30 * 0.18, 0.18);
      const yearsToRetire = Math.max(0, retireAge - age);
      factor += Math.min(yearsToRetire * 0.005, 0.07);
      if (retireAge < 60) factor -= 0.05;
      factor = Math.max(0.18, Math.min(factor, 0.65));
      const pension = Math.round(salary * factor);
      const need = Math.round(salary * 0.75);
      const coverage = Math.min(100, Math.round(pension / need * 100));
      let status: string, label: string;
      if (coverage >= 65) { status = "verde"; label = "Cobertura razonable"; }
      else if (coverage >= 40) { status = "amarillo"; label = "Hay brecha — manejable"; }
      else { status = "rojo"; label = "Hay brecha importante"; }
      return { pension, need, coverage, status, label };
    }
    const formatMXN = (n: number) => n.toLocaleString("es-MX");
    function animateCount(el: HTMLElement | null, target: number) {
      if (!el) return;
      if (prefersReducedMotion) { el.textContent = formatMXN(target); return; }
      const duration = 720, start = performance.now();
      function frame(now: number) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el!.textContent = formatMXN(Math.round(target * eased));
        if (t < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
    function buildReading(inputs: CalcInputs, sim: Sim): string {
      const { coverage, status } = sim;
      const ageKey = state.age || "lt35", law = inputs.law;
      const lead = (READING.lead as Record<string, (c: number) => string>)[status](coverage);
      const worry = state.worry ? WORRIES[state.worry] : undefined;
      const worryCallback = worry ? " " + worry.inReading : "";
      const lente = READING.lente[law] || READING.lente.no_se;
      const wctx = state.work ? WORK_CONTEXTS[state.work] : undefined;
      const workInsight = wctx ? " " + wctx.insight : "";
      return lead + worryCallback + lente + workInsight + (READING.matiz[ageKey] || "");
    }
    function escapeHtml(s: string) {
      return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
    }
    function renderSystemAnchors() {
      const host = $("jAnchors"); if (!host) return;
      const law = (state.calc && state.calc.inputs && state.calc.inputs.law) || "no_se";
      const anchors = pickAnchorsFor(state.age, law);
      host.innerHTML = "";
      anchors.forEach((a) => {
        const tile = document.createElement("article");
        tile.className = "j-anchor";
        tile.innerHTML = `
          <p class="j-anchor__label">${escapeHtml(a.label)}</p>
          <p class="j-anchor__value"><strong>${escapeHtml(a.value)}</strong> <span>${escapeHtml(a.unit)}</span></p>
          <p class="j-anchor__detail">${escapeHtml(a.detail)}</p>
          <p class="j-anchor__source">Fuente: <a href="${a.sourceLink}" target="_blank" rel="noopener">${escapeHtml(a.sourceLabel)}</a></p>`;
        host.appendChild(tile);
      });
    }
    function renderResult(inputs: CalcInputs, sim: Sim) {
      animateCount($("jResultAmount"), sim.pension);
      $("jNeedAmount")!.textContent = "$" + formatMXN(sim.need);
      $("jHaveAmount")!.textContent = "$" + formatMXN(sim.pension);
      const haveBar = $("jHaveBar")!;
      haveBar.style.width = "0%";
      requestAnimationFrame(() => requestAnimationFrame(() => { haveBar.style.width = sim.coverage + "%"; }));
      $("jCoveragePct")!.textContent = sim.coverage + "% de cobertura";
      const sem = $("jSemaforo")!;
      sem.dataset.status = sim.status;
      $("jSemaforoLabel")!.textContent = sim.label;
      sem.classList.remove("j-semaforo--reveal");
      void sem.offsetWidth;
      sem.classList.add("j-semaforo--reveal");
      $("jReadingBody")!.textContent = buildReading(inputs, sim);
      renderSystemAnchors();
      const ageKey = state.age || "lt35";
      const calcCta = $("jCalcCta") as HTMLAnchorElement | null;
      if (calcCta) calcCta.href = CALC_POR_ETAPA[ageKey] || "/pensiones/calculadoras";
      const calcExtra = $("jCalcExtra");
      if (calcExtra) {
        const extras = CALC_EXTRA_POR_ETAPA[ageKey];
        if (extras && extras.length) {
          const links = extras.map((x) => `<a class="j-link" href="${x.href}">${x.texto}</a>`);
          calcExtra.innerHTML = extras.length === 1
            ? "Para tu etapa también es relevante la " + links[0] + "."
            : "Para tu etapa también son relevantes la " + links.join(" y la ") + ".";
          calcExtra.hidden = false;
        } else calcExtra.hidden = true;
      }
    }

    const form = $("jCalcForm") as HTMLFormElement;
    const onSubmit = (e: Event) => {
      e.preventDefault();
      const f = e.currentTarget as HTMLFormElement;
      const age = parseInt((f.elements.namedItem("age") as HTMLInputElement).value, 10);
      const retireAge = parseInt((f.elements.namedItem("retireAge") as HTMLInputElement).value, 10);
      const salary = parseInt((f.elements.namedItem("salary") as HTMLInputElement).value, 10);
      const years = parseInt((f.elements.namedItem("years") as HTMLInputElement).value, 10);
      const law = (f.elements.namedItem("law") as unknown as HTMLSelectElement).value;
      const bad: string[] = [];
      if (!Number.isFinite(age) || age < 18 || age > 85) bad.push("jAge");
      if (!Number.isFinite(retireAge) || retireAge < 50 || retireAge > 80) bad.push("jRetireAge");
      if (!Number.isFinite(salary) || salary < 3000) bad.push("jSalary");
      if (!Number.isFinite(years) || years < 0) bad.push("jYears");
      if (!law) bad.push("jLaw");
      f.querySelectorAll(".j-field__input").forEach((i) => i.classList.remove("j-field__input--error"));
      if (bad.length) { bad.forEach((id) => $(id)?.classList.add("j-field__input--error")); $(bad[0])?.focus(); return; }
      if (retireAge <= age) { const el = $("jRetireAge")!; el.classList.add("j-field__input--error"); el.focus(); return; }
      const inputs = { age, retireAge, salary, years, law };
      const sim = simulatePension(inputs);
      state.calc = { inputs, sim }; saveState(state);
      renderResult(inputs, sim);
      showScreen("result");
    };
    form?.addEventListener("submit", onSubmit);

    function bootFromHash() {
      const hash = (window.location.hash || "").replace("#", "");
      if (hash && SCREENS.includes(hash)) {
        if (hash === "enganche") { if (state.age) renderEnganche(); showScreen(hash); }
        else if (hash === "result" && state.calc) { renderResult(state.calc.inputs, state.calc.sim); showScreen(hash); }
        else if (hash === "calc" || hash === "test") showScreen(hash);
        else showScreen("intro");
      }
    }
    bootFromHash();

    return () => {
      document.removeEventListener("click", onGoClick);
      optHandlers.forEach(([el, h]) => el.removeEventListener("click", h));
      form?.removeEventListener("submit", onSubmit);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="j-body" ref={rootRef}>
      <link rel="stylesheet" href="/pensiones/sar-29/vendor/fonts.css" precedence="default" />
      <main className="j-stage" id="jStage" aria-live="polite">

        {/* SCREEN 0 — INTRO */}
        <section className="j-screen j-screen--active j-intro" data-screen="intro">
          <div className="j-intro__inner container">
            <p className="j-eyebrow">Tu ruta personal</p>
            <h1 className="j-intro__title">El retiro no se improvisa.</h1>
            <div className="gold-line gold-line--left j-intro__rule"></div>
            <p className="j-intro__lede">
              Se diseña, se planifica, se emprende y se construye hoy.
              En el observatorio Datos México estudiamos el sistema de retiro mexicano con datos oficiales,
              y este recorrido es la primera versión de cómo acompañaremos a las personas
              a entender su situación —tengas la edad que tengas, hayas cotizado lo que hayas cotizado.
            </p>
            <div className="j-intro__cta-row">
              <button type="button" className="j-btn j-btn--primary" data-go="test">Comenzar el recorrido</button>
              <span className="j-intro__time">Toma menos de 3 minutos</span>
            </div>
            <div className="j-intro__chips" aria-label="Lo que vivirás">
              <span className="j-chip">Test breve</span>
              <span className="j-chip">Cálculo orientativo</span>
              <span className="j-chip">Tu lectura con contexto del SAR</span>
              <span className="j-chip">Tu siguiente paso</span>
            </div>
          </div>
          <div className="j-intro__bg" aria-hidden="true"></div>
        </section>

        {/* SCREEN 1 — TEST */}
        <section className="j-screen j-test" data-screen="test">
          <div className="container j-screen__inner">
            <Progress active={0} done={[]} />
            <header className="j-test__header">
              <p className="j-eyebrow">Antes de empezar</p>
              <h2 className="j-test__title">Cuéntanos un poco de ti</h2>
              <div className="gold-line gold-line--left"></div>
              <p className="j-test__lede">Cuatro preguntas. Lo justo para que el resto del recorrido te quede bien.</p>
            </header>
            <div className="j-test__inner">
              <div className="j-question is-active" data-q="1">
                <p className="j-question__num">Pregunta <strong>1</strong> de 4</p>
                <h3 className="j-question__text">¿Cuántos años tienes?</h3>
                <div className="j-options" role="radiogroup" aria-label="Tu edad">
                  <Opt k="age" v="lt35" label="Menos de 35" hint="Te queda más tiempo del que crees" />
                  <Opt k="age" v="35_49" label="Entre 35 y 49" hint="Estás en el momento decisivo" />
                  <Opt k="age" v="50_64" label="Entre 50 y 64" hint="Aterrizar fechas y decisiones" />
                  <Opt k="age" v="gte65" label="65 o más" hint="Administrar y disfrutar el retiro" />
                </div>
              </div>
              <div className="j-question" data-q="2">
                <p className="j-question__num">Pregunta <strong>2</strong> de 4</p>
                <h3 className="j-question__text">¿Cuál es tu situación laboral hoy?</h3>
                <div className="j-options" role="radiogroup" aria-label="Tu situación laboral">
                  <Opt k="work" v="empleado" label="Asalariado en una empresa" hint="Tu patrón aporta a tu AFORE" />
                  <Opt k="work" v="independiente" label="Independiente o por honorarios" hint="Tú decides cómo y cuánto ahorrar" />
                  <Opt k="work" v="mixto" label="Mixto (las dos cosas)" hint="Combinas formal e independiente" />
                  <Opt k="work" v="transicion" label="En transición / sin actividad ahora" hint="Vale empezar desde donde estés" />
                  <Opt k="work" v="jubilado" label="Ya jubilado o pensionado" hint="Administrar lo que construiste" />
                </div>
              </div>
              <div className="j-question" data-q="3">
                <p className="j-question__num">Pregunta <strong>3</strong> de 4</p>
                <h3 className="j-question__text">¿Cuál es tu mayor pregunta sobre tu retiro?</h3>
                <div className="j-options" role="radiogroup" aria-label="Tu pregunta principal">
                  <Opt k="worry" v="cuanto_voy" label="¿Cuánto voy a recibir?" />
                  <Opt k="worry" v="cuanto_necesito" label="¿Cuánto voy a necesitar?" />
                  <Opt k="worry" v="que_me_falta" label="¿Qué me falta para el retiro que quiero?" />
                  <Opt k="worry" v="que_hago_hoy" label="¿Qué puedo hacer desde hoy?" />
                  <Opt k="worry" v="como_sera" label="¿Cómo será mi vida cuando me retire?" />
                </div>
              </div>
              <div className="j-question" data-q="4">
                <p className="j-question__num">Pregunta <strong>4</strong> de 4</p>
                <h3 className="j-question__text">¿Cuánto tiempo llevas cotizando al SAR / IMSS / ISSSTE?</h3>
                <p className="j-question__sub">Si no recuerdas exacto, una aproximación basta.</p>
                <div className="j-options" role="radiogroup" aria-label="Años cotizando">
                  <Opt k="years" v="lt5" label="Menos de 5 años" />
                  <Opt k="years" v="5_10" label="Entre 5 y 10 años" />
                  <Opt k="years" v="11_20" label="Entre 11 y 20 años" />
                  <Opt k="years" v="gt20" label="Más de 20 años" />
                  <Opt k="years" v="no_se" label="No lo sé con certeza" hint="Es más común de lo que crees" />
                </div>
              </div>
              <div className="j-question j-test__resolved" data-q="resolved">
                <p className="j-eyebrow">Esto es lo que vimos</p>
                <h3 className="j-test__segment-title">Tu etapa: <span id="jSegmentName">—</span></h3>
                <div className="gold-line gold-line--left"></div>
                <p className="j-test__segment-desc" id="jSegmentDesc">—</p>
                <p className="j-test__segment-worry" id="jSegmentWorry" hidden>—</p>
                <button type="button" className="j-btn j-btn--primary" data-go="enganche">Continuar al siguiente paso</button>
              </div>
            </div>
          </div>
        </section>

        {/* SCREEN 2 — ENGANCHE */}
        <section className="j-screen j-enganche" data-screen="enganche">
          <div className="container j-screen__inner">
            <Progress active={1} done={[0]} />
            <div className="j-enganche__card">
              <p className="j-eyebrow" id="jEngancheEyebrow">Lo que está en juego</p>
              <h2 className="j-enganche__title" id="jEngancheTitle">—</h2>
              <div className="gold-line gold-line--left"></div>
              <p className="j-enganche__body" id="jEngancheBody">—</p>
              <p className="j-enganche__worry" id="jEngancheWorry" hidden>—</p>
              <div className="j-enganche__cta-row">
                <button type="button" className="j-btn j-btn--ghost" data-go="test">Atrás</button>
                <button type="button" className="j-btn j-btn--primary" data-go="calc">Calcular mi pensión estimada</button>
              </div>
            </div>
          </div>
        </section>

        {/* SCREEN 3 — CALCULADORA ILUSTRATIVA */}
        <section className="j-screen j-calc" data-screen="calc">
          <div className="container j-screen__inner">
            <Progress active={2} done={[0, 1]} />
            <aside className="j-illustrative" role="note" aria-label="Aviso de resultado ilustrativo">
              <InfoIcon size={22} />
              <div className="j-illustrative__body">
                <p className="j-illustrative__title">La cifra que verás es un ejemplo, no el cálculo de tu pensión real.</p>
                <p className="j-illustrative__text">
                  Este recorrido es la primera versión pública de la experiencia del observatorio.
                  La calculadora de abajo te dará un <strong>número de ejemplo</strong> con base en lo que escribas,
                  para mostrarte cómo se vive el recorrido. <strong>No es una estimación real de tu pensión</strong>,
                  no la uses para tomar decisiones financieras. La calculadora completa, con validación actuarial,
                  ya está publicada: <a href="/pensiones/calculadoras/pension">usa la calculadora de pensión estimada</a>.
                </p>
              </div>
            </aside>
            <header className="j-calc__header">
              <h2 className="j-calc__title">Calculadora de pensión estimada</h2>
              <div className="gold-line gold-line--left"></div>
              <p className="j-calc__lede">Cinco datos. Te damos una estimación orientativa de tu pensión mensual al jubilarte.</p>
              <p className="j-calc__framing" id="jCalcFraming" hidden>—</p>
            </header>
            <form className="j-calc__form" id="jCalcForm" noValidate>
              <div className="j-field">
                <label htmlFor="jAge" className="j-field__label">Edad actual</label>
                <input type="number" id="jAge" name="age" className="j-field__input" min={18} max={85} inputMode="numeric" required />
                <p className="j-field__hint">Años cumplidos.</p>
              </div>
              <div className="j-field">
                <label htmlFor="jRetireAge" className="j-field__label">Edad a la que te gustaría retirarte</label>
                <input type="number" id="jRetireAge" name="retireAge" className="j-field__input" min={50} max={80} defaultValue={65} inputMode="numeric" required />
                <p className="j-field__hint">Habitualmente entre 60 y 65.</p>
              </div>
              <div className="j-field">
                <label htmlFor="jSalary" className="j-field__label">Salario mensual bruto</label>
                <div className="j-field__money">
                  <span className="j-field__money-prefix">$</span>
                  <input type="number" id="jSalary" name="salary" className="j-field__input j-field__input--money" min={3000} max={500000} inputMode="numeric" placeholder="20,000" required />
                  <span className="j-field__money-suffix">MXN</span>
                </div>
                <p className="j-field__hint">Si tienes ingresos variables, una estimación promedio basta.</p>
              </div>
              <div className="j-field">
                <label htmlFor="jYears" className="j-field__label">Años cotizando al SAR / IMSS / ISSSTE</label>
                <input type="number" id="jYears" name="years" className="j-field__input" min={0} max={50} inputMode="numeric" required />
                <p className="j-field__hint">Tu primer empleo formal cuenta desde ahí.</p>
              </div>
              <div className="j-field">
                <label htmlFor="jLaw" className="j-field__label">Régimen aplicable</label>
                <select id="jLaw" name="law" className="j-field__input" required defaultValue="">
                  <option value="">Selecciona uno</option>
                  <option value="ley73">Ley 73 (comencé a cotizar antes de julio de 1997)</option>
                  <option value="ley97">Ley 97 (comencé a cotizar en julio de 1997 o después)</option>
                  <option value="no_se">No estoy seguro/a</option>
                </select>
                <p className="j-field__hint">Si no recuerdas, "no estoy seguro" funciona para esta vista ilustrativa.</p>
              </div>
              <div className="j-calc__cta-row">
                <button type="button" className="j-btn j-btn--ghost" data-go="enganche">Atrás</button>
                <button type="submit" className="j-btn j-btn--primary">Calcular</button>
              </div>
            </form>
          </div>
        </section>

        {/* SCREEN 4 — RESULTADO */}
        <section className="j-screen j-result" data-screen="result">
          <div className="container j-screen__inner">
            <Progress active={3} done={[0, 1, 2]} extraActive={[4, 5]} />
            <aside className="j-illustrative j-illustrative--compact" role="note" aria-label="Aviso de resultado ilustrativo">
              <InfoIcon size={20} />
              <div className="j-illustrative__body">
                <p className="j-illustrative__title">La cifra de abajo es un ejemplo, no tu pensión real.</p>
                <p className="j-illustrative__text">Es el número que produce nuestra calculadora preliminar con base en lo que escribiste. <strong>No es una estimación financiera ni una recomendación</strong>. La calculadora completa, validada actuarialmente, ya está disponible: <a href="/pensiones/calculadoras/pension">calcula ahí tu cifra</a>.</p>
              </div>
            </aside>

            <section className="j-result__hero" aria-labelledby="jResultTitle">
              <p className="j-eyebrow">Paso 3 · Tu resultado</p>
              <h2 className="j-result__title" id="jResultTitle">Tu pensión estimada mensual</h2>
              <div className="gold-line gold-line--left"></div>
              <div className="j-result__amount">
                <span className="j-result__currency">$</span>
                <span className="j-result__value" id="jResultAmount">0</span>
                <span className="j-result__period">MXN al mes</span>
                <span className="j-result__badge" aria-label="Cifra de ejemplo, no real">Ejemplo</span>
              </div>
              <div className="j-semaforo" id="jSemaforo" data-status="rojo" aria-label="Nivel de cobertura">
                <span className="j-semaforo__light j-semaforo__light--rojo"></span>
                <span className="j-semaforo__light j-semaforo__light--amarillo"></span>
                <span className="j-semaforo__light j-semaforo__light--verde"></span>
                <span className="j-semaforo__label" id="jSemaforoLabel">—</span>
              </div>
              <figure className="j-coverage" aria-labelledby="jCoverageCaption">
                <div className="j-coverage__row">
                  <p className="j-coverage__row-label">Ingreso que probablemente necesitarás <small>(estimado en ~75% de tu salario)</small></p>
                  <div className="j-coverage__bar j-coverage__bar--need"><span style={{ width: "100%" }}></span></div>
                  <p className="j-coverage__row-val" id="jNeedAmount">$0</p>
                </div>
                <div className="j-coverage__row">
                  <p className="j-coverage__row-label">Pensión estimada según los datos que diste</p>
                  <div className="j-coverage__bar j-coverage__bar--have"><span id="jHaveBar" style={{ width: "0%" }}></span></div>
                  <p className="j-coverage__row-val"><span id="jHaveAmount">$0</span> <span className="j-coverage__pct" id="jCoveragePct">0%</span></p>
                </div>
                <figcaption id="jCoverageCaption" className="j-coverage__caption">
                  Cobertura: qué porcentaje del ingreso que probablemente necesitarás cubriría la pensión estimada.
                </figcaption>
              </figure>
            </section>

            <section className="j-result__reading" aria-labelledby="jReadingTitle">
              <p className="j-eyebrow">Paso 4 · Tu lectura</p>
              <h3 className="j-result__sub" id="jReadingTitle">Qué significa este número para ti</h3>
              <div className="gold-line gold-line--left"></div>
              <p className="j-reading__body" id="jReadingBody">—</p>
              <p className="j-reading__pillars">
                Esta lectura combina las dos caras del retiro que estudia el observatorio:
                <strong>el sistema</strong> (cómo se calcula tu pensión, qué define cuánto recibirás)
                y <strong>tu vida</strong> (qué necesitarás, cómo será tu día a día).
                La distancia entre las dos es lo que llamamos <em>brecha</em> —y es lo que se puede empezar a cerrar hoy.
              </p>
              <div className="j-result__anchors-wrap">
                <p className="j-eyebrow j-anchors__eyebrow">Lo que vemos en el sistema</p>
                <h4 className="j-anchors__title">Tres cifras del SAR mexicano que conviene tener presentes para leer tu situación</h4>
                <div className="j-anchors" id="jAnchors" aria-label="Datos del sistema relevantes a tu situación"></div>
                <p className="j-anchors__note">
                  Las cifras de arriba son <strong>verificadas</strong>; provienen de la serie de estudios del SAR publicados por el observatorio.
                  La estimación de pensión es <em>ilustrativa</em> —ver banner. El contexto del sistema es real; para tu cifra individual usa la <a href="/pensiones/calculadoras/pension">calculadora de pensión estimada</a>, con supuestos actuariales validados.
                </p>
              </div>
            </section>

            {/* PASO 5 — Siguiente paso (5.5: sin cards de curso/guía; apunta a la calculadora real de la etapa) */}
            <section className="j-result__action" aria-labelledby="jActionTitle">
              <p className="j-eyebrow">Paso 5 · Tu siguiente paso</p>
              <h3 className="j-result__sub" id="jActionTitle">Lo que tiene sentido hacer ahora</h3>
              <div className="gold-line gold-line--left"></div>
              <p className="j-reading__body" style={{ margin: "0 0 1.25rem" }}>
                El primer producto real de este paso son las calculadoras del observatorio: publicadas, con supuestos públicos, fuentes oficiales y validación actuarial. El botón de abajo te lleva a la más relevante para tu etapa.
              </p>
              <div className="j-action__row">
                <a id="jCalcCta" className="j-btn j-btn--primary" href="/pensiones/calculadoras">Usa la calculadora de tu etapa</a>
              </div>
              <p className="j-action__sub" id="jCalcExtra" hidden>Para tu etapa también es relevante la <a className="j-link" href="/pensiones/calculadoras/gastos-medicos">calculadora de gastos médicos en retiro</a>.</p>
              <p className="j-action__sub">O <button type="button" className="j-link" data-go="intro">comenzar de nuevo el recorrido</button> con otros datos.</p>
            </section>
          </div>
        </section>

      </main>
    </div>
  );
}

function Progress({ active, done, extraActive = [] }: { active: number; done: number[]; extraActive?: number[] }) {
  const labels = ["Tu etapa", "Lo que está en juego", "Tus números", "Tu resultado", "Tu lectura", "Tu siguiente paso"];
  return (
    <nav className="j-progress" aria-label="Progreso del recorrido">
      <ol className="j-progress__bar">
        {labels.map((l, i) => {
          const cls = done.includes(i) ? "is-done" : (i === active || extraActive.includes(i)) ? "is-active" : "";
          return (
            <li key={i} className={`j-progress__step ${cls}`.trim()} data-step={i}>
              <span className="j-progress__dot"></span>
              <span className="j-progress__label">{l}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Opt({ k, v, label, hint }: { k: string; v: string; label: string; hint?: string }) {
  return (
    <button type="button" className="j-option" data-key={k} data-value={v}>
      <span className="j-option__label">{label}</span>
      {hint ? <span className="j-option__hint">{hint}</span> : null}
    </button>
  );
}

function InfoIcon({ size }: { size: number }) {
  return (
    <svg className="j-illustrative__icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
