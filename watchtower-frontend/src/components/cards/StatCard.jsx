import React from 'react';

export default function StatCard({ title, value, newValue, icon: Icon, colorClass = "text-accent" }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 flex items-center justify-between shadow-sm transition-all duration-300 hover:shadow-md hover:border-accent/40 hover:-translate-y-1 cursor-default">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-primary-muted uppercase tracking-wider">{title}</p>
        <div className="flex items-center gap-3">
          <h3 className="text-3xl font-black text-primary tracking-tight">
            {value?.toLocaleString() || 0}
          </h3>
          {newValue > 0 && (
            <span className="text-[11px] font-bold bg-success/15 text-success px-2.5 py-1 rounded-full animate-pulse">
              +{newValue} (24h)
            </span>
          )}
        </div>
      </div>
      
      {/* بک‌گراند آیکون با افکت ملایم */}
      <div className={`p-3.5 rounded-2xl bg-background shadow-inner ${colorClass}`}>
        <Icon className="w-7 h-7" />
      </div>
    </div>
  );
}