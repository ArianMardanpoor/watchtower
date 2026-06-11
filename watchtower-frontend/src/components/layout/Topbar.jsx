import React from 'react';
import GlobalSearch from '../search/GlobalSearch';

export default function Topbar() {
  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 z-10">
      {/* کامپوننت سرچ گلوبال که قبلاً ساختیم را اینجا فراخوانی می‌کنیم */}
      <div className="flex-1 max-w-xl">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-4">
        <div className="text-xs font-mono text-primary-muted bg-badge px-2 py-1 rounded border border-border">
          API: Connected
        </div>
      </div>
    </header>
  );
}