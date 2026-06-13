import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function TimelineChart({ data }) {
  // جلوگیری از کرش اگر دیتا آرایه نباشه
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="flex h-[300px] items-center justify-center text-sm text-[#8b949e]">دیتای تایم‌لاین در دسترس نیست.</div>;
  }

  const chartData = [...data].reverse();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#161b22]/95 backdrop-blur-md border border-[#30363d] p-3 rounded-xl shadow-2xl">
          <p className="text-[#8b949e] text-xs mb-2 pb-2 border-b border-[#30363d]">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm my-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-[#e6edf3] capitalize">{entry.name}:</span>
              <span className="font-bold text-white ml-auto">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
          {/* گرید ملایم‌تر برای پس‌زمینه */}
          <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
          <XAxis dataKey="date" stroke="#8b949e" fontSize={11} tickLine={false} axisLine={false} dy={10} />
          <YAxis stroke="#8b949e" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }} iconType="circle" />
          
          <Line 
            type="monotone" 
            dataKey="subdomains" 
            name="Subdomains" 
            stroke="#58a6ff" 
            strokeWidth={3} 
            dot={false} 
            activeDot={{ r: 6, strokeWidth: 0, fill: '#58a6ff', className: 'drop-shadow-md' }} 
          />
          <Line 
            type="monotone" 
            dataKey="live" 
            name="Live" 
            stroke="#3fb950" 
            strokeWidth={3} 
            dot={false} 
            activeDot={{ r: 6, strokeWidth: 0, fill: '#3fb950', className: 'drop-shadow-md' }} 
          />
          <Line 
            type="monotone" 
            dataKey="http" 
            name="HTTP" 
            stroke="#d29922" 
            strokeWidth={3} 
            dot={false} 
            activeDot={{ r: 6, strokeWidth: 0, fill: '#d29922', className: 'drop-shadow-md' }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}