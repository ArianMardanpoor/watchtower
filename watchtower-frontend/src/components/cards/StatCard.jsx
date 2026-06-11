import React from 'react';

export default function StatCard({ title, value, newValue, icon: Icon, colorClass = "text-accent" }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-5 flex items-center justify-between shadow-sm">
      <div>
        <p className="text-sm font-medium text-primary-muted mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-bold text-primary">{value?.toLocaleString() || 0}</h3>
          {newValue > 0 && (
            <span className="text-xs font-medium bg-success/10 text-success px-2 py-0.5 rounded-full">
              +{newValue} (24h)
            </span>
          )}
        </div>
      </div>
      <div className={`p-3 rounded-md bg-background ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}