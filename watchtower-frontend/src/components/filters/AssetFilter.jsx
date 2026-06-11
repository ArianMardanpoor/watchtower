import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

export default function AssetFilter({ filters, setFilter, resetFilters }) {
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchValue, 500);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilter('search', debouncedSearch);
    }
  }, [debouncedSearch, filters.search, setFilter]);

  return (
    <div className="bg-surface border border-border rounded-lg p-4 mb-6 space-y-4">
      <div className="flex items-center gap-2 mb-2 text-primary">
        <Filter className="w-4 h-4" />
        <h3 className="text-sm font-semibold">Filter Combined Assets</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* جستجو */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-muted" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full bg-background border border-border rounded-md pl-9 pr-3 py-1.5 text-sm text-primary focus:ring-1 focus:ring-accent outline-none"
          />
        </div>

        {/* وضعیت دارایی */}
        <select
          value={filters.status || 'all'}
          onChange={(e) => setFilter('status', e.target.value)}
          className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm text-primary focus:ring-1 focus:ring-accent outline-none font-medium text-accent"
        >
          <option value="all">Status: All Assets</option>
          <option value="both">Fully Alive (HTTP + Live)</option>
          <option value="http_only">HTTP Only</option>
          <option value="live_only">Live Only (No HTTP)</option>
          <option value="none">Dead / No Response</option>
        </select>

        {/* فیلتر برنامه */}
        <input
          type="text"
          placeholder="Program name..."
          value={filters.program || ''}
          onChange={(e) => setFilter('program', e.target.value)}
          className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm text-primary focus:ring-1 focus:ring-accent outline-none"
        />

        {/* فیلتر Provider */}
        <input
          type="text"
          placeholder="Provider (e.g. subfinder)..."
          value={filters.provider || ''}
          onChange={(e) => setFilter('provider', e.target.value)}
          className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm text-primary focus:ring-1 focus:ring-accent outline-none"
        />
      </div>

      <div className="flex justify-end pt-2 border-t border-border mt-4">
        <button
          onClick={() => {
            setSearchValue('');
            resetFilters();
          }}
          className="flex items-center gap-1.5 text-sm text-primary-muted hover:text-danger transition-colors px-2 py-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Filters
        </button>
      </div>
    </div>
  );
}