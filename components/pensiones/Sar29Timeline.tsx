"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { sar29Entregas } from "@/lib/pensiones/sar29";
import "./sar29-timeline.css";

export function Sar29Timeline() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add("is-inview");
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="timeline section"
      aria-labelledby="timeline-title"
    >
      <link
        rel="stylesheet"
        href="/pensiones/sar-29/vendor/fonts.css"
        precedence="default"
      />
      <div className="container">
        <header className="timeline__header">
          <p className="timeline__eyebrow">Serie Panorama</p>
          <h2 id="timeline-title" className="timeline__title">
            El SAR en 29 años
          </h2>
          <div className="gold-line gold-line--left"></div>
          <p className="timeline__lede">
            Recursos administrados por las AFOREs — cierre de cada año, en
            miles de millones de pesos (mmdp). De{" "}
            <strong>6 mmdp al cierre de 1997</strong> (medio año de arranque,
            jul–dic) a <strong>8,302 mmdp en 2025</strong>. Cada barra abre el
            estudio del año.
          </p>
        </header>

        <figure
          className="timeline__chart"
          role="figure"
          aria-label="Crecimiento de los recursos administrados por las AFOREs de 1997 a 2025"
        >
          <div className="timeline__plot">
            <div className="timeline__grid" aria-hidden="true">
              <span data-label="9,000"></span>
              <span data-label="6,000"></span>
              <span data-label="3,000"></span>
              <span data-label="0"></span>
            </div>
            <ol
              className="timeline__bars"
              style={{ gridTemplateColumns: "repeat(29, 1fr)" }}
              role="list"
            >
              {sar29Entregas.map((e) => (
                <li
                  key={e.year}
                  className="timeline__item"
                  style={{ "--bar-h": e.barH, "--delay": e.delay } as CSSProperties}
                >
                  <a href={e.href} className="timeline__bar" aria-label={e.aria}>
                    <span className="timeline__tooltip">
                      <strong>{e.mmdp}</strong>
                      <em>{e.unit}</em>
                    </span>
                    <span className="timeline__fill" aria-hidden="true"></span>
                    <span className="timeline__year">{e.tick}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
          <figcaption className="timeline__caption">
            <span className="timeline__legend">
              <span className="timeline__legend-swatch"></span> Recursos al
              cierre de cada año
            </span>{" "}
            <span className="timeline__source">
              Fuente: CONSAR vía{" "}
              <a
                href="https://datosmexico.org"
                className="timeline__source-link"
                target="_blank"
                rel="noopener"
              >
                datosmexico.org
              </a>
            </span>
          </figcaption>
        </figure>

        <a href="/pensiones/sar-29" className="timeline__cta">
          Ver los 29 estudios
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </a>
      </div>
    </section>
  );
}
