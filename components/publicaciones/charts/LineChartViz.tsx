"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type LineChartVizProps = {
  data: Array<Record<string, string | number>>;
  xKey: string;
  yKeys: Array<{ key: string; label: string; color?: string }>;
  height?: number;
  caption?: string;
};

export function LineChartViz({
  data,
  xKey,
  yKeys,
  height = 320,
  caption,
}: LineChartVizProps) {
  const defaultColors = ["#15803D", "#B45309", "#6B7280", "#9CA3AF"];

  return (
    <figure className="my-8">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 12, fill: "#4B5563" }}
            axisLine={{ stroke: "#D1D5DB" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#4B5563" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#FAFAF9",
              border: "1px solid #D1D5DB",
              borderRadius: "6px",
              fontSize: "13px",
            }}
          />
          {yKeys.map((y, i) => (
            <Line
              key={y.key}
              type="monotone"
              dataKey={y.key}
              name={y.label}
              stroke={y.color || defaultColors[i] || "#6B7280"}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      {caption && (
        <figcaption className="mt-2 text-center font-mono text-xs text-text-subtle">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
