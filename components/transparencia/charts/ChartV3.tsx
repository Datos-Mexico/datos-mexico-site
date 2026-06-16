"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "./ChartCard";
import type { ChartV3 as ChartV3Type } from "@/lib/transparencia/types";

function fmtMoney(n: number): string {
  return `$${n.toFixed(2)}`;
}

export function ChartV3({
  eyebrow,
  title,
  note,
  domainMax,
  items,
}: ChartV3Type) {
  // Stacked bars: first segment from 0 to min (transparent), second from min
  // to max (colored). Visible bar = range segment.
  const data = items.map((i) => ({
    variety: i.variety,
    fromZero: i.min,
    range: i.max - i.min,
  }));

  const height = Math.max(180, items.length * 60 + 80);

  const table = (
    <table className="w-full border-collapse border border-border text-left text-[13px]">
      <thead className="bg-muted/60">
        <tr>
          <th className="border border-border px-3 py-2 font-semibold">
            Variedad
          </th>
          <th className="border border-border px-3 py-2 font-semibold">
            Rango nacional · MXN / kg
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((it) => (
          <tr key={it.variety}>
            <td className="border border-border px-3 py-2">{it.variety}</td>
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
            dataKey="variety"
            tick={{ fontSize: 12, fill: "#4B5563" }}
            axisLine={false}
            tickLine={false}
            width={140}
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
