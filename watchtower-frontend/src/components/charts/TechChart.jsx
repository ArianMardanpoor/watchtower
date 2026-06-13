import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function TechChart({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return <div className="flex h-[250px] items-center justify-center text-sm text-[#8b949e]">دیتای تکنولوژی موجود نیست.</div>;
  }

  const chartData = Object.entries(data)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#161b22] border border-[#30363d] p-3 rounded-lg shadow-lg">
          <p className="text-[#8957e5] font-bold text-sm mb-1">{payload[0].payload.name}</p>
          <p className="text-[#e6edf3] text-xs">تکرار: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 10, left: 40, bottom: 0 }}>
          <defs>
            <linearGradient id="techGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8957e5" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#a371f7" stopOpacity={1} />
            </linearGradient>
          </defs>
          <XAxis type="number" stroke="#8b949e" fontSize={11} tickLine={false} axisLine={false} />
          {/* عرض محور Y رو بیشتر کردم تا اسم‌ها جا بشن */}
          <YAxis dataKey="name" type="category" stroke="#e6edf3" fontSize={11} tickLine={false} axisLine={false} width={90} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#30363d', opacity: 0.3, rx: 6 }} />
          <Bar dataKey="count" fill="url(#techGradient)" radius={[0, 6, 6, 0]} barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}