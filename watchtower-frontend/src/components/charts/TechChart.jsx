import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function TechChart({ data }) {
  if (!data || Object.keys(data).length === 0) return <div className="text-sm text-primary-muted text-center py-10">No tech data.</div>;

  const chartData = Object.entries(data)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // فقط ۱۰ تای اول

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 0 }}>
          <XAxis type="number" stroke="#8b949e" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis dataKey="name" type="category" stroke="#e6edf3" fontSize={11} tickLine={false} axisLine={false} width={80} />
          <Tooltip 
            cursor={{ fill: '#30363d', opacity: 0.4 }}
            contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', color: '#e6edf3', borderRadius: '6px' }}
          />
          <Bar dataKey="count" fill="#8957e5" radius={[0, 4, 4, 0]} barSize={15} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}