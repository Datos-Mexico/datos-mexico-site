"use client";

import { useActiveSection } from "@/lib/hooks/useActiveSection";
import { cn } from "@/lib/utils";
import type { MouseEvent } from "react";

const sections = [
  { id: "principios", label: "Principios" },
  { id: "pipeline", label: "Pipeline técnico" },
  { id: "editorial", label: "Estándares editoriales" },
  { id: "auditoria", label: "Cómo auditarnos" },
  { id: "acceso", label: "Acceso programático" },
  { id: "cambios", label: "Registro de cambios" },
] as const;

export function MetodologiaTOC() {
  const ids = sections.map((s) => s.id);
  const active = useActiveSection(ids, 96);

  function onClick(e: MouseEvent<HTMLAnchorElement>, id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const top = el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top, behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
  }

  return (
    <aside
      aria-label="Tabla de contenido"
      className="hidden w-56 lg:block"
    >
      <div className="sticky top-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-subtle">
          En esta página
        </p>
        <ol className="mt-4 space-y-1">
          {sections.map((s) => {
            const isActive = active === s.id;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => onClick(e, s.id)}
                  className={cn(
                    "block border-l-2 py-1.5 pl-3 font-sans text-[13px] leading-[1.4] transition-colors",
                    isActive
                      ? "border-primary text-foreground font-medium"
                      : "border-transparent text-text-subtle hover:text-foreground hover:border-border",
                  )}
                  aria-current={isActive ? "true" : undefined}
                >
                  {s.label}
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </aside>
  );
}
