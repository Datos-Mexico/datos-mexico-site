"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ErrorBar,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "./ChartCard";
import type { ChartV2 as ChartV2Type } from "@/lib/transparencia/types";

function fmtMoney(n: number): string {
  return `$${n.toFixed(2)}`;
}

function fmtRange(min: number, max: number): string {
  return min === max ? fmtMoney(min) : `${fmtMoney(min)}–${fmtMoney(max)}`;
}

export function ChartV2({
  eyebrow,
  title,
  note,
  domainMax,
  items,
}: ChartV2Type) {
  // Bar value = min. ErrorBar adds [0, max-min] asymmetric whisker upward.
  // Singletons (min === max) → whisker collapsed to a point (invisible).
  const data = items.map((i) => ({
    store: i.store,
    precio: i.min,
    error: [0, i.max - i.min] as [number, number],
  }));

  const height = Math.max(220, items.length * 44 + 80);

  const table = (
    <table className="w-full border-collapse border border-border text-left text-[13px]">
      <thead className="bg-muted/60">
        <tr>
          <th className="border border-border px-3 py-2 font-semibold">
            Establecimiento
          </th>
          <th className="border border-border px-3 py-2 font-semibold">
            Precio reportado · MXN / kg
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((it) => (
          <tr key={it.store}>
            <td className="border border-border px-3 py-2">{it.store}</td>
            <td className="border border-border px-3 py-2 font-mono">
              {fmtRange(it.min, it.max)}
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
            dataKey="store"
            tick={{ fontSize: 12, fill: "#4B5563" }}
            axisLine={false}
            tickLine={false}
            width={140}
          />
          <Bar
            dataKey="precio"
            fill="#6B7280"
            radius={[0, 4, 4, 0]}
            isAnimationActive={false}
          >
            <ErrorBar
              dataKey="error"
              direction="x"
              width={8}
              stroke="#15803D"
              strokeWidth={2}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
