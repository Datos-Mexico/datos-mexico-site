"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Row = { x: string; y: number };

type AreaSeriesVizProps = {
  data: Row[];
  height?: number;
  yLabel: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
};

export function AreaSeriesViz({
  data,
  height = 360,
  yLabel,
  decimals = 2,
  prefix = "",
  suffix = "",
}: AreaSeriesVizProps) {
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("es-MX", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
    [decimals],
  );

  const formatY = (n: number) => `${prefix}${formatter.format(n)}${suffix}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={data}
        margin={{ top: 16, right: 16, left: 8, bottom: 16 }}
      >
        <defs>
          <linearGradient id="pulsoFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#15803D" stopOpacity={0.32} />
            <stop offset="100%" stopColor="#15803D" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#E5E7EB"
          vertical={false}
        />
        <XAxis
          dataKey="x"
          tick={{ fontSize: 12, fill: "#4B5563" }}
          axisLine={{ stroke: "#D1D5DB" }}
          tickLine={false}
          interval="preserveStartEnd"
          minTickGap={32}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#4B5563" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatY}
          width={64}
        />
        <Tooltip
          contentStyle={{
            background: "#FAFAF9",
            border: "1px solid #D1D5DB",
            borderRadius: "6px",
            fontSize: "13px",
          }}
          formatter={(v) => {
            const n = typeof v === "number" ? v : Number(v);
            return [Number.isFinite(n) ? formatY(n) : "—", yLabel] as [
              string,
              string,
            ];
          }}
        />
        <Area
          type="monotone"
          dataKey="y"
          stroke="#15803D"
          strokeWidth={2.5}
          fill="url(#pulsoFill)"
          activeDot={{
            r: 4,
            stroke: "#15803D",
            strokeWidth: 2,
            fill: "#FAFAF9",
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
