"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { sar29Entregas } from "@/lib/pensiones/sar29";
import "./hero-sar29-mini.css";

/**
 * Miniatura viva de la serie SAR-29 para la tarjeta del hero (F9).
 *
 * - Forma: los 29 `barH` reales de `sar29Entregas` — la misma fuente que la
 *   pieza real. Cero cifras: sin tooltips, sin años, sin ejes.
 * - Entrada: cadencia idéntica al original (0.9s, cubic-bezier(0.16,1,0.3,1),
 *   stagger por `delay`), disparada por IntersectionObserver.
 * - Hover: proximidad al cursor vía rAF — cada barra se eleva y profundiza
 *   de tono según su distancia al puntero (falloff gaussiano). Sin datos.
 * - Aislado: único client component; la tarjeta y el hero siguen en servidor.
 */
export function HeroSar29Mini() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      // Estado final directo (el CSS ya apaga animación y lift); sin rAF.
      root.classList.add("is-inview");
      return;
    }

    // Entrada — mismo mecanismo que la pieza real.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          root.classList.add("is-inview");
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(root);

    // Proximidad al cursor: falloff gaussiano por barra, lerp de intensidad
    // al entrar/salir. El loop se detiene solo cuando todo converge.
    const bars = Array.from(root.querySelectorAll<HTMLElement>(".hp-mini__bar"));
    const SIGMA = 26; // px — cubre ~5 barras alrededor del cursor
    let centers: number[] = [];
    let mouseX = 0;
    let appliedX = NaN;
    let intensity = 0;
    let target = 0;
    let raf = 0;

    const measure = () => {
      centers = bars.map((b) => {
        const r = b.getBoundingClientRect();
        return r.left + r.width / 2;
      });
    };

    const tick = () => {
      intensity += (target - intensity) * 0.18;
      if (Math.abs(target - intensity) < 0.01) intensity = target;
      for (let i = 0; i < bars.length; i++) {
        const d = centers[i] - mouseX;
        const p = intensity * Math.exp(-(d * d) / (2 * SIGMA * SIGMA));
        bars[i].style.setProperty("--prox", p < 0.004 ? "0" : p.toFixed(3));
      }
      appliedX = mouseX;
      if (intensity === target) {
        raf = 0; // convergió; onMove/onEnter/onLeave lo despiertan
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onEnter = (e: PointerEvent) => {
      measure();
      mouseX = e.clientX;
      target = 1;
      wake();
    };
    const onMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      if (mouseX !== appliedX) wake();
    };
    const onLeave = () => {
      target = 0;
      wake();
    };

    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);

    return () => {
      io.disconnect();
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={rootRef} className="hp-mini" aria-hidden="true">
      {sar29Entregas.map((e) => (
        <span
          key={e.year}
          className="hp-mini__bar"
          style={{ "--h": e.barH, "--delay": e.delay } as CSSProperties}
        >
          <span className="hp-mini__fill" />
        </span>
      ))}
    </div>
  );
}
