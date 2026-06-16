"use client";

import { ChartCard } from "./ChartCard";
import type {
  TimelineLaneId,
  TimelineV5 as TimelineV5Type,
} from "@/lib/transparencia/types";

// Lane visuals (no valoración):
// - medicion: relleno gris sólido
// - verificacion: relleno blanco con borde gris (anillo)
// - declaracion: relleno verde acento (la única naturaleza discursiva)
const LANE_FILL: Record<TimelineLaneId, string> = {
  medicion: "#6B7280",
  verificacion: "#FFFFFF",
  declaracion: "#15803D",
};
const LANE_STROKE: Record<TimelineLaneId, string> = {
  medicion: "#6B7280",
  verificacion: "#6B7280",
  declaracion: "#15803D",
};
const LANE_STROKE_WIDTH: Record<TimelineLaneId, number> = {
  medicion: 0,
  verificacion: 2.5,
  declaracion: 0,
};

function laneBadgeClasses(lane: TimelineLaneId): string {
  switch (lane) {
    case "medicion":
      return "bg-[#6B7280] text-white";
    case "verificacion":
      return "border-2 border-[#6B7280] bg-white text-[#374151]";
    case "declaracion":
      return "bg-[#15803D] text-white";
  }
}

function laneLabelShort(lane: TimelineLaneId): string {
  switch (lane) {
    case "medicion":
      return "Medición";
    case "verificacion":
      return "Verificación en campo";
    case "declaracion":
      return "Declaración / testimonio";
  }
}

function dayDiff(from: string, to: string): number {
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

export function ChartV5({
  eyebrow,
  title,
  note,
  startDate,
  endDate,
  lanes,
  nodes,
}: TimelineV5Type) {
  // SVG geometry (desktop)
  const VW = 800;
  const VH = 280;
  const ML = 150;
  const MR = 30;
  const MT = 30;
  const MB = 50;
  const chartW = VW - ML - MR;
  const totalDays = dayDiff(startDate, endDate) || 1;
  const laneIndex = (id: TimelineLaneId): number =>
    lanes.findIndex((l) => l.id === id);
  const laneY = (i: number): number =>
    MT + ((VH - MT - MB) / (lanes.length + 1)) * (i + 1);

  const xAt = (date: string): number =>
    ML + (dayDiff(startDate, date) / totalDays) * chartW;

  // Month markers
  const monthMarkers = [
    { date: "2026-04-01", label: "abr" },
    { date: "2026-05-01", label: "may" },
    { date: "2026-06-01", label: "jun" },
  ].filter(
    (m) => dayDiff(startDate, m.date) >= 0 && dayDiff(m.date, endDate) >= 0,
  );

  // Accessible table
  const table = (
    <table className="w-full border-collapse border border-border text-left text-[13px]">
      <thead className="bg-muted/60">
        <tr>
          <th className="border border-border px-3 py-2 font-semibold whitespace-nowrap">
            Fecha
          </th>
          <th className="border border-border px-3 py-2 font-semibold whitespace-nowrap">
            Naturaleza
          </th>
          <th className="border border-border px-3 py-2 font-semibold">
            Hecho
          </th>
        </tr>
      </thead>
      <tbody>
        {nodes.map((n) => (
          <tr key={n.id}>
            <td className="border border-border px-3 py-2 align-top font-mono whitespace-nowrap">
              {n.dateLabel}
            </td>
            <td className="border border-border px-3 py-2 align-top">
              <span
                className={`inline-block rounded px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.1em] ${laneBadgeClasses(n.lane)}`}
              >
                {laneLabelShort(n.lane)}
              </span>
            </td>
            <td className="border border-border px-3 py-2 align-top">
              <div className="font-sans font-medium text-foreground">
                {n.headline}
              </div>
              <p className="mt-1 font-sans text-[13px] leading-[1.5] text-text-subtle">
                {n.description}
              </p>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <ChartCard eyebrow={eyebrow} title={title} note={note} table={table}>
      {/* Desktop SVG */}
      <div className="hidden md:block">
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          className="h-auto w-full"
          role="img"
          aria-label={title}
        >
          {/* Lane labels (left) */}
          {lanes.map((lane, i) => (
            <text
              key={lane.id}
              x={ML - 12}
              y={laneY(i)}
              textAnchor="end"
              fontSize={12}
              fill="#4B5563"
              alignmentBaseline="middle"
              dominantBaseline="middle"
            >
              {lane.label}
            </text>
          ))}

          {/* Lane baselines (subtle dashed) */}
          {lanes.map((lane, i) => (
            <line
              key={`b-${lane.id}`}
              x1={ML}
              y1={laneY(i)}
              x2={ML + chartW}
              y2={laneY(i)}
              stroke="#E5E7EB"
              strokeDasharray="3 5"
              strokeWidth={1}
            />
          ))}

          {/* Time axis */}
          <line
            x1={ML}
            y1={VH - MB + 8}
            x2={ML + chartW}
            y2={VH - MB + 8}
            stroke="#D1D5DB"
            strokeWidth={1}
          />

          {/* Month markers */}
          {monthMarkers.map((mk) => (
            <g key={mk.date}>
              <line
                x1={xAt(mk.date)}
                y1={VH - MB + 4}
                x2={xAt(mk.date)}
                y2={VH - MB + 12}
                stroke="#D1D5DB"
                strokeWidth={1}
              />
              <text
                x={xAt(mk.date)}
                y={VH - MB + 26}
                textAnchor="middle"
                fontSize={11}
                fill="#6B7280"
              >
                {mk.label}
              </text>
            </g>
          ))}
          <text
            x={ML + chartW}
            y={VH - MB + 42}
            textAnchor="end"
            fontSize={10}
            fill="#9CA3AF"
          >
            2026
          </text>

          {/* Nodes */}
          {nodes.map((n) => {
            const x = xAt(n.date);
            const y = laneY(laneIndex(n.lane));
            return (
              <g key={n.id}>
                <circle
                  cx={x}
                  cy={y}
                  r={8}
                  fill={LANE_FILL[n.lane]}
                  stroke={LANE_STROKE[n.lane]}
                  strokeWidth={LANE_STROKE_WIDTH[n.lane]}
                />
                <title>{`${n.dateLabel} — ${n.headline}`}</title>
              </g>
            );
          })}
        </svg>
      </div>
    </ChartCard>
  );
}
