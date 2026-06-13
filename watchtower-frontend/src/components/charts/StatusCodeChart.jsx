import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function StatusCodeChart({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return <div className="flex h-[250px] items-center justify-center text-sm text-[#8b949e]">دیتای Status Code موجود نیست.</div>;
  }

  const chartData = Object.entries(data)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count);

  const getColorHex = (code) => {
    const num = parseInt(code);
    if (num >= 200 && num < 300) return '#3fb950'; // success
    if (num >= 300 && num < 400) return '#58a6ff'; // accent
    if (num >= 400 && num < 500) return '#d29922'; // warning
    if (num >= 500) return '#f85149'; // danger
    return '#8b949e'; // muted
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#161b22] border border-[#30363d] p-3 rounded-lg shadow-lg">
          <p className="text-[#8b949e] text-xs mb-1">Status Code: {payload[0].payload.code}</p>
          <p className="text-[#e6edf3] font-bold text-sm">تعداد: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
          <XAxis dataKey="code" stroke="#8b949e" fontSize={11} tickLine={false} axisLine={false} dy={10} />
          <YAxis stroke="#8b949e" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#30363d', opacity: 0.3, rx: 6 }} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColorHex(entry.code)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}