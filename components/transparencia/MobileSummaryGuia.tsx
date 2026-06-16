"use client";

import { useRef, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export function MobileSummaryGuia({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);

  function onClickInside(e: React.MouseEvent<HTMLDetailsElement>) {
    const target = e.target as HTMLElement;
    const link = target.closest('a[href^="#"]');
    if (link && ref.current) {
      requestAnimationFrame(() => {
        if (ref.current) ref.current.open = false;
      });
    }
  }

  return (
    <details
      ref={ref}
      onClick={onClickInside}
      className="group mt-8 rounded-lg border border-border bg-muted/40 px-5 py-4 lg:hidden"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between text-text-subtle">
        <span className="font-mono text-[12px] uppercase tracking-[0.12em]">
          Resumen y guía de la pieza
        </span>
        <ChevronDown
          className="h-4 w-4 transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="mt-5">{children}</div>
    </details>
  );
}
