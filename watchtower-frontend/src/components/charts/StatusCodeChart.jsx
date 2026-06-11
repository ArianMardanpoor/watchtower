import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getStatusCodeColor } from '../../utils/colors';

export default function StatusCodeChart({ data }) {
  if (!data || Object.keys(data).length === 0) return <div className="text-sm text-primary-muted text-center py-10">No status code data.</div>;

  // تبدیل آبجکت به آرایه برای Recharts
  const chartData = Object.entries(data)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count);

  // استخراج رنگ خام (کد هگز) بر اساس کلاس Tailwind برای Recharts
  const getColorHex = (code) => {
    const num = parseInt(code);
    if (num >= 200 && num < 300) return '#3fb950'; // success
    if (num >= 300 && num < 400) return '#58a6ff'; // accent
    if (num >= 400 && num < 500) return '#d29922'; // warning
    if (num >= 500) return '#f85149'; // danger
    return '#8b949e'; // muted
  };

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="code" stroke="#8b949e" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#8b949e" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            cursor={{ fill: '#30363d', opacity: 0.4 }}
            contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', color: '#e6edf3', borderRadius: '6px' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColorHex(entry.code)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}