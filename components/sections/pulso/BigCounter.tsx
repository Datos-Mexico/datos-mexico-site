"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type BigCounterProps = {
  target: number;
  decimals?: number;
  durationMs?: number;
  delayMs?: number;
  className?: string;
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function BigCounter({
  target,
  decimals = 0,
  durationMs = 1400,
  delayMs = 0,
  className,
}: BigCounterProps) {
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("es-MX", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
    [decimals],
  );

  const [value, setValue] = useState(0);
  const startedAt = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window
      .matchMedia("(prefers-reduced-motion: reduce)")
      .matches;

    if (prefersReducedMotion) {
      rafId.current = requestAnimationFrame(() => setValue(target));
      return () => {
        if (rafId.current !== null) cancelAnimationFrame(rafId.current);
      };
    }

    const start = performance.now() + delayMs;
    const tick = (now: number) => {
      if (now < start) {
        rafId.current = requestAnimationFrame(tick);
        return;
      }
      if (startedAt.current === null) startedAt.current = now;
      const t = Math.min(1, (now - startedAt.current) / durationMs);
      setValue(target * easeOutCubic(t));
      if (t < 1) {
        rafId.current = requestAnimationFrame(tick);
      } else {
        setValue(target);
      }
    };

    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
      startedAt.current = null;
    };
  }, [target, durationMs, delayMs]);

  return (
    <span className={cn("tabular-nums", className)}>{formatter.format(value)}</span>
  );
}
