"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type DonutChartVizProps = {
  data: Array<{ name: string; value: number }>;
  height?: number;
  caption?: string;
};

export function DonutChartViz({ data, height = 320, caption }: DonutChartVizProps) {
  const colors = [
    "#15803D",
    "#6B7280",
    "#9CA3AF",
    "#D1D5DB",
    "#E5E7EB",
    "#F3F4F6",
    "#374151",
    "#1F2937",
  ];

  return (
    <figure className="my-8">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${((percent || 0) * 100).toFixed(1)}%`
            }
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#FAFAF9",
              border: "1px solid #D1D5DB",
              borderRadius: "6px",
              fontSize: "13px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {caption && (
        <figcaption className="mt-2 text-center font-mono text-xs text-text-subtle">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
