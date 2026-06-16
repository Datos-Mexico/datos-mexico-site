"use client";

import type React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "./ChartCard";
import type { ChartV4 as ChartV4Type } from "@/lib/transparencia/types";

function fmtMoney(n: number): string {
  return `$${n.toFixed(2)}`;
}

export function ChartV4({
  eyebrow,
  title,
  note,
  domainMax,
  items,
}: ChartV4Type) {
  // Stacked bars como V3. Etiqueta YAxis combina variedad + orígenes en dos
  // líneas (con un salto explícito que el tickFormatter divide).
  const data = items.map((i) => ({
    label: `${i.variety}|${i.origins}`,
    fromZero: i.min,
    range: i.max - i.min,
  }));

  const height = Math.max(200, items.length * 70 + 80);

  // Custom tick para mostrar variedad + orígenes en líneas separadas.
  // recharts TickProp shape: { x, y, payload: { value } } pero los tipos
  // exactos varían entre versiones; uso `unknown` y desestructuro defensivamente.
  const renderTick = (props: unknown): React.ReactElement => {
    const p = props as {
      x?: number | string;
      y?: number | string;
      payload?: { value?: string };
    };
    const value = p.payload?.value ?? "";
    const [variety, origins] = value.split("|");
    const tx = typeof p.x === "number" ? p.x : 0;
    const ty = typeof p.y === "number" ? p.y : 0;
    return (
      <g transform={`translate(${tx},${ty})`}>
        <text x={-8} y={-4} textAnchor="end" fontSize={12} fill="#4B5563">
          {variety}
        </text>
        <text
          x={-8}
          y={12}
          textAnchor="end"
          fontSize={10}
          fill="#6B7280"
          fontStyle="italic"
        >
          {origins}
        </text>
      </g>
    );
  };

  const table = (
    <table className="w-full border-collapse border border-border text-left text-[13px]">
      <thead className="bg-muted/60">
        <tr>
          <th className="border border-border px-3 py-2 font-semibold">
            Variedad
          </th>
          <th className="border border-border px-3 py-2 font-semibold">
            Orígenes
          </th>
          <th className="border border-border px-3 py-2 font-semibold">
            Rango mayoreo · MXN / kg
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((it) => (
          <tr key={it.variety}>
            <td className="border border-border px-3 py-2">{it.variety}</td>
            <td className="border border-border px-3 py-2">{it.origins}</td>
            <td className="border border-border px-3 py-2 font-mono">
              {`${fmtMoney(it.min)}–${fmtMoney(it.max)}`}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <ChartCard eyebrow={eyebrow} title={title} note={note} table={table}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 8, right: 32, left: 8, bottom: 24 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E5E7EB"
            vertical={true}
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[0, domainMax]}
            tick={{ fontSize: 11, fill: "#4B5563" }}
            tickFormatter={(v) => `$${v}`}
            axisLine={{ stroke: "#D1D5DB" }}
            tickLine={false}
            label={{
              value: "MXN / kg",
              position: "insideBottomRight",
              offset: -8,
              style: { fontSize: 11, fill: "#4B5563" },
            }}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={renderTick}
            axisLine={false}
            tickLine={false}
            width={180}
          />
          <Bar
            dataKey="fromZero"
            stackId="r"
            fill="transparent"
            isAnimationActive={false}
          />
          <Bar
            dataKey="range"
            stackId="r"
            fill="#15803D"
            radius={[0, 4, 4, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
