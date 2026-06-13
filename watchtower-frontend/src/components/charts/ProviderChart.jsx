import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#58a6ff', '#3fb950', '#d29922', '#f85149', '#8957e5', '#2ea043'];

export default function ProviderChart({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return <div className="flex h-[250px] items-center justify-center text-sm text-[#8b949e]">دیتایی برای نمایش وجود ندارد.</div>;
  }

  const chartData = Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#161b22]/90 backdrop-blur-sm border border-[#30363d] p-3 rounded-lg shadow-xl">
          <p className="text-[#e6edf3] font-medium text-sm">{`${payload[0].name}`}</p>
          <p className="text-xs mt-1" style={{ color: payload[0].payload.fill }}>
            تعداد: <span className="font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[250px] w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
            cornerRadius={4}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '12px', color: '#8b949e' }} 
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}