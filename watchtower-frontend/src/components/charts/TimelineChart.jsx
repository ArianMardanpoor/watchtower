import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function TimelineChart({ data }) {
  if (!data || data.length === 0) return <div className="text-primary-muted text-sm text-center py-10">No timeline data available.</div>;

  // معکوس کردن دیتا برای نمایش از گذشته به حال
  const chartData = [...data].reverse();

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
          <XAxis dataKey="date" stroke="#8b949e" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#8b949e" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', color: '#e6edf3' }}
            itemStyle={{ color: '#e6edf3' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Line type="monotone" dataKey="subdomains" name="Subdomains" stroke="#58a6ff" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="live" name="Live" stroke="#3fb950" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="http" name="HTTP" stroke="#d29922" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}