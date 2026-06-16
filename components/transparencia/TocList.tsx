"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { TocEntry } from "@/lib/transparencia/types";

type Props = {
  entries: ReadonlyArray<TocEntry>;
  onClickEntry?: () => void;
};

export function TocList({ entries, onClickEntry }: Props) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const anchors = entries.map((e) => e.anchor);
    const elements = anchors
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const visible = new Map<string, number>();

    const observer = new IntersectionObserver(
      (records) => {
        for (const r of records) {
          if (r.isIntersecting) {
            visible.set(r.target.id, r.intersectionRatio);
          } else {
            visible.delete(r.target.id);
          }
        }
        if (visible.size === 0) return;
        let bestId = "";
        let bestTop = Infinity;
        for (const id of visible.keys()) {
          const el = document.getElementById(id);
          if (!el) continue;
          const top = el.getBoundingClientRect().top;
          if (top < bestTop) {
            bestTop = top;
            bestId = id;
          }
        }
        if (bestId) setActiveId(bestId);
      },
      { rootMargin: "-12% 0px -70% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [entries]);

  return (
    <ol className="mt-4 space-y-3">
      {entries.map((e) => {
        const isActive = e.anchor === activeId;
        return (
          <li key={e.anchor}>
            <a
              href={`#${e.anchor}`}
              onClick={onClickEntry}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "block border-l-2 pl-3 py-1 transition-colors",
                isActive
                  ? "border-primary text-foreground"
                  : "border-border text-text-subtle hover:text-foreground hover:border-foreground/30",
              )}
            >
              <span className="font-sans text-[14px] font-medium block">
                {e.label}
              </span>
              {e.sub && (
                <span className="font-sans text-[12px] leading-[1.4] block mt-1 text-text-subtle">
                  {e.sub}
                </span>
              )}
            </a>
          </li>
        );
      })}
    </ol>
  );
}
