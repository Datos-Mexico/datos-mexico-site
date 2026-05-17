"use client";

import { useEffect, useState } from "react";

export function useActiveSection(sectionIds: string[], offsetTop = 96): string | null {
  const [activeId, setActiveId] = useState<string | null>(
    sectionIds[0] ?? null,
  );

  useEffect(() => {
    if (typeof window === "undefined" || sectionIds.length === 0) return;

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    // Map of id -> intersection ratio (most-recent observation).
    const visibility = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(
            entry.target.id,
            entry.isIntersecting ? entry.intersectionRatio : 0,
          );
        }

        // Pick the section with the highest visibility ratio that is currently
        // intersecting. Fallback: first section above the viewport.
        let best: { id: string; ratio: number } | null = null;
        for (const [id, ratio] of visibility) {
          if (ratio > 0 && (!best || ratio > best.ratio)) {
            best = { id, ratio };
          }
        }

        if (best) {
          setActiveId(best.id);
          return;
        }

        // Nothing is intersecting — pick the section closest to (and above)
        // the viewport top so the TOC still highlights something sensible.
        const scrolled = window.scrollY + offsetTop;
        let candidate: { id: string; top: number } | null = null;
        for (const el of elements) {
          const top = el.offsetTop;
          if (top <= scrolled && (!candidate || top > candidate.top)) {
            candidate = { id: el.id, top };
          }
        }
        if (candidate) setActiveId(candidate.id);
      },
      {
        // Sliver of the viewport that counts as "active". The negative top
        // margin pushes the trigger past the sticky header.
        rootMargin: `-${offsetTop}px 0px -55% 0px`,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionIds, offsetTop]);

  return activeId;
}
