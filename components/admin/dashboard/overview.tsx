"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Cell, Tooltip } from "recharts"
import { LineChart, Line } from "recharts"
import { AreaChart, Area } from "recharts"

interface OverviewProps {
  data: any[];
  chartStyle?: 'bar' | 'line';
  chartColor?: string;
}

export function Overview({ 
  data, 
  chartStyle = 'bar',
  chartColor = '#2563eb' 
}: OverviewProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      {chartStyle === 'bar' ? (
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
          <Bar dataKey="total" fill={chartColor} radius={[4, 4, 0, 0]} />
          <Tooltip />
        </BarChart>
      ) : (
        <LineChart data={data}>
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke={chartColor}
            strokeWidth={2}
            dot={{ fill: chartColor }}
          />
          <Tooltip />
        </LineChart>
      )}
    </ResponsiveContainer>
  );
}