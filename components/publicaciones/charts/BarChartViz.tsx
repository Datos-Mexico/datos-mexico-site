"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type BarChartVizProps = {
  data: Array<Record<string, string | number>>;
  xKey: string;
  yKey: string;
  yLabel?: string;
  height?: number;
  caption?: string;
  highlight?: boolean;
};

export function BarChartViz({
  data,
  xKey,
  yKey,
  yLabel,
  height = 320,
  caption,
  highlight = false,
}: BarChartVizProps) {
  const barColor = highlight ? "#15803D" : "#6B7280";

  return (
    <figure className="my-8">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 16 }}>
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
            label={
              yLabel
                ? {
                    value: yLabel,
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 12, fill: "#4B5563" },
                  }
                : undefined
            }
          />
          <Tooltip
            contentStyle={{
              background: "#FAFAF9",
              border: "1px solid #D1D5DB",
              borderRadius: "6px",
              fontSize: "13px",
            }}
            cursor={{ fill: "#F3F4F6" }}
          />
          <Bar dataKey={yKey} fill={barColor} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      {caption && (
        <figcaption className="mt-2 text-center font-mono text-xs text-text-subtle">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
